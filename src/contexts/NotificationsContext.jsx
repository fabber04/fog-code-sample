import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { formatRelativeFromMaybeTimestamp } from '../utils/relativeTime';
import NotificationsMobilePanel from '../components/notifications/NotificationsMobilePanel';

const NotificationsContext = createContext(null);

/** Defer unsubscribe to avoid Firestore watch-stream race (SDK ca9/b815). */
function safeUnsubscribe(unsub) {
  if (typeof unsub !== 'function') return;
  queueMicrotask(() => {
    try {
      unsub();
    } catch (err) {
      console.error('Firestore listener cleanup failed:', err);
    }
  });
}

function sortNotifications(items) {
  return [...items].sort((a, b) => {
    const ta = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
    const tb = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
    return tb - ta;
  });
}

function mapNotificationDocs(snapshot) {
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

function notificationLoadErrorMessage(err) {
  const code = err?.code || '';
  if (code === 'permission-denied') {
    return 'Unable to load notifications right now. Please try again in a moment.';
  }
  if (code === 'failed-precondition') {
    return 'Notifications are still setting up. Please try again in a few minutes.';
  }
  if (code === 'unavailable') {
    return 'Notifications are temporarily unavailable. Check your connection and try again.';
  }
  return 'Unable to load notifications right now. Please try again later.';
}

export function NotificationsProvider({ children }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rawNotifications, setRawNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setError('Notifications are not available on this app right now.');
      setRawNotifications([]);
      return undefined;
    }

    let cancelled = false;
    let unsub = () => {};

    const applySnapshot = (snapshot) => {
      if (cancelled) return;
      setError(null);
      setRawNotifications(mapNotificationDocs(snapshot));
    };

    const applyFallbackSnapshot = (snapshot) => {
      if (cancelled) return;
      setError(null);
      setRawNotifications(sortNotifications(mapNotificationDocs(snapshot)));
    };

    const failLoad = (err) => {
      if (cancelled) return;
      console.error('Notifications listener failed:', err);
      setError(notificationLoadErrorMessage(err));
      setRawNotifications([]);
    };

    const subscribeFallback = () => {
      safeUnsubscribe(unsub);
      const fallbackQuery = query(
        collection(db, 'notifications'),
        where('published', '==', true),
        limit(50)
      );
      unsub = onSnapshot(fallbackQuery, applyFallbackSnapshot, failLoad);
    };

    const primaryQuery = query(
      collection(db, 'notifications'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    unsub = onSnapshot(
      primaryQuery,
      applySnapshot,
      (err) => {
        if (cancelled) return;
        if (err?.code === 'failed-precondition') {
          subscribeFallback();
          return;
        }
        failLoad(err);
      }
    );

    return () => {
      cancelled = true;
      safeUnsubscribe(unsub);
    };
  }, []);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid || !db) {
      setReadIds(new Set());
      return undefined;
    }

    let cancelled = false;
    let unsub = () => {};

    unsub = onSnapshot(
      collection(db, 'users', uid, 'readNotifications'),
      (snapshot) => {
        if (cancelled) return;
        setReadIds(new Set(snapshot.docs.map((d) => d.id)));
      },
      (err) => {
        if (cancelled) return;
        console.error(err);
      }
    );

    return () => {
      cancelled = true;
      safeUnsubscribe(unsub);
    };
  }, [currentUser?.uid]);

  const notifications = useMemo(
    () =>
      rawNotifications.map((n) => ({
        id: n.id,
        title: n.title ?? '',
        message: n.message ?? '',
        type: n.type ?? 'announcement',
        target: typeof n.target === 'string' ? n.target : '',
        scrollToId: typeof n.scrollToId === 'string' ? n.scrollToId : '',
        read: Boolean(currentUser?.uid && readIds.has(n.id)),
        time: formatRelativeFromMaybeTimestamp(n.createdAt),
      })),
    [rawNotifications, readIds, currentUser?.uid]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const persistMarkRead = useCallback(
    async (notificationId) => {
      if (!currentUser?.uid || !db) return;
      await setDoc(
        doc(db, 'users', currentUser.uid, 'readNotifications', notificationId),
        { readAt: serverTimestamp() },
        { merge: true }
      );
    },
    [currentUser?.uid]
  );

  const persistMarkAllRead = useCallback(async () => {
    if (!currentUser?.uid || !db) return;
    const unreadItems = notifications.filter((n) => !n.read);
    if (!unreadItems.length) return;
    const batch = writeBatch(db);
    unreadItems.forEach((n) => {
      batch.set(
        doc(db, 'users', currentUser.uid, 'readNotifications', n.id),
        { readAt: serverTimestamp() },
        { merge: true }
      );
    });
    await batch.commit();
  }, [currentUser?.uid, notifications]);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const openPanel = useCallback(() => setOpen(true), []);

  const handleSelect = useCallback(
    (notification) => {
      if (!notification.read) void persistMarkRead(notification.id);
      const target = notification.target?.trim?.() || '';
      setOpen(false);
      setTimeout(() => {
        if (!target) return;
        navigate(target);
        if (notification.scrollToId) {
          setTimeout(() => {
            const element = document.getElementById(notification.scrollToId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.style.transition = 'background-color 0.3s ease';
              element.style.backgroundColor = '#dbeafe';
              setTimeout(() => {
                element.style.backgroundColor = '';
              }, 2000);
            }
          }, 300);
        }
      }, 150);
    },
    [navigate, persistMarkRead]
  );

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.notifications-dropdown') &&
        !event.target.closest('.notifications-mobile-overlay') &&
        !event.target.closest('.notifications-bell-trigger')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const value = useMemo(
    () => ({
      open,
      close,
      toggle,
      openPanel,
      unreadCount,
      notifications,
      error,
      currentUser,
      persistMarkAllRead,
      handleSelect,
    }),
    [
      open,
      close,
      toggle,
      openPanel,
      unreadCount,
      notifications,
      error,
      currentUser,
      persistMarkAllRead,
      handleSelect,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsMobilePanel />
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
