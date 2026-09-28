import React from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import NotificationRow from './NotificationRow';

const NotificationBell = ({ variant = 'header', className = '', onInteract }) => {
  const {
    open,
    toggle,
    close,
    unreadCount,
    notifications,
    error,
    currentUser,
    persistMarkAllRead,
    handleSelect,
  } = useNotifications();

  const handleClick = () => {
    onInteract?.();
    toggle();
  };

  const badge =
    unreadCount > 0 ? (
      <span
        className={
          variant === 'mobileHeader'
            ? 'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white'
            : 'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white lg:h-6 lg:w-6 lg:text-sm'
        }
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    ) : null;

  const trigger =
    variant === 'mobileHeader' ? (
      <button
        type="button"
        onClick={handleClick}
        className={`notifications-bell-trigger relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 ${className}`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />
        {badge}
      </button>
    ) : (
      <button
        type="button"
        onClick={handleClick}
        className={`notifications-bell-trigger relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#2563eb] ${className}`}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {badge}
      </button>
    );

  if (variant === 'mobileHeader') {
    return trigger;
  }

  return (
    <div className="relative notifications-dropdown">
      {trigger}
      {open && (
        <div className="absolute right-0 z-50 mt-2 hidden w-80 rounded-xl border border-gray-200 bg-white shadow-lg lg:block lg:w-96 xl:w-[28rem]">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 lg:text-xl">Notifications</h3>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {error ? (
              <div className="p-4 text-center text-sm text-red-600 lg:p-6">{error}</div>
            ) : notifications.length === 0 ? (
              <NotificationsEmptyState />
            ) : (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="space-y-2 border-t border-gray-200 p-4 lg:p-6">
              {!currentUser && (
                <p className="text-center text-xs text-gray-500">Sign in to track read/unread.</p>
              )}
              <button
                type="button"
                disabled={!currentUser}
                onClick={() => {
                  void persistMarkAllRead();
                  close();
                }}
                className="w-full text-sm font-medium text-[#2563eb] hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 lg:text-base"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function NotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-gray-500">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Bell size={24} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-700">No notifications yet</p>
      <p className="mt-1 max-w-xs text-xs text-gray-400">
        Updates from your team will appear here when they are published.
      </p>
    </div>
  );
}

export default NotificationBell;
