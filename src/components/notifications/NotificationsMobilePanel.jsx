import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import NotificationRow from './NotificationRow';
import { NotificationsEmptyState } from './NotificationBell';

const NotificationsMobilePanel = () => {
  const {
    open,
    close,
    notifications,
    error,
    currentUser,
    persistMarkAllRead,
    handleSelect,
  } = useNotifications();

  if (!open) return null;

  return createPortal(
    <div className="notifications-mobile-overlay fixed inset-0 z-[100] flex flex-col bg-white lg:hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-3">
        <button
          type="button"
          onClick={close}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50"
          aria-label="Close notifications"
        >
          <ChevronLeft size={22} />
        </button>
        <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
        <div className="w-10" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {error ? (
          <div className="p-4 text-center text-sm text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <NotificationsEmptyState />
        ) : (
          notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onSelect={handleSelect}
              compact
            />
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="shrink-0 border-t border-gray-200 p-4">
          {!currentUser && (
            <p className="mb-2 text-center text-xs text-gray-500">
              Sign in to track read and unread.
            </p>
          )}
          <button
            type="button"
            disabled={!currentUser}
            onClick={() => {
              void persistMarkAllRead();
              close();
            }}
            className="w-full text-sm font-medium text-[#2563eb] disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>,
    document.body
  );
};

export default NotificationsMobilePanel;
