import React from 'react';
import { Calendar, Bell, BookOpen, Headphones, MessageCircle } from 'lucide-react';

const TYPE_META = {
  event: { icon: Calendar, color: 'bg-blue-500', label: 'Event' },
  prayer: { icon: MessageCircle, color: 'bg-green-500', label: 'Prayer' },
  podcast: { icon: Headphones, color: 'bg-violet-500', label: 'Podcast' },
  devotional: { icon: BookOpen, color: 'bg-amber-500', label: 'Devotional' },
  announcement: { icon: Bell, color: 'bg-orange-500', label: 'Announcement' },
};

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.announcement;
}

const NotificationRow = ({ notification, onSelect, compact = false }) => {
  const meta = getTypeMeta(notification.type);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`w-full border-b border-gray-100 text-left transition-colors hover:bg-gray-50 active:bg-gray-50 ${
        compact ? 'p-4' : 'p-4 lg:p-6'
      } ${!notification.read ? 'bg-blue-50/80' : 'bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${meta.color}`}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-semibold leading-snug ${
                !notification.read ? 'text-gray-900' : 'text-gray-700'
              } ${compact ? '' : 'lg:text-base'}`}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563eb]" />
            )}
          </div>
          <p className={`mt-1 text-sm text-gray-600 ${compact ? '' : 'lg:text-base'}`}>
            {notification.message}
          </p>
          <p className={`mt-2 text-xs text-gray-400 ${compact ? '' : 'lg:text-sm'}`}>
            {meta.label} · {notification.time}
          </p>
        </div>
      </div>
    </button>
  );
};

export default NotificationRow;
