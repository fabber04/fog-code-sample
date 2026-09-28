import React, { useState } from 'react';
import { Bell, Send, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminNotificationsService } from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';

const TYPE_OPTIONS = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'event', label: 'Event' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'prayer', label: 'Prayer' },
];

const QUICK_PATHS = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' },
  { label: 'Podcasts', path: '/podcasts' },
  { label: 'Library', path: '/library' },
  { label: 'Devotionals', path: '/devotionals' },
  { label: 'Prayer', path: '/prayer-requests' },
];

const AdminNotifications = () => {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [target, setTarget] = useState('');
  const [scrollToId, setScrollToId] = useState('');
  const [published, setPublished] = useState(true);
  const [important, setImportant] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const m = message.trim();
    if (!t || !m) {
      toast.error('Title and message are required.');
      return;
    }

    const body = {
      title: t,
      message: m,
      type,
      published,
      important,
      notify_email: notifyEmail,
      notify_sms: notifySms,
    };

    const tr = target.trim();
    const sc = scrollToId.trim();
    if (tr) body.target = tr;
    if (sc) body.scroll_to_id = sc;

    try {
      setSubmitting(true);
      await adminNotificationsService.publishNotification(body);
      toast.success('Notification published — members will see it in the bell shortly.');
      setTitle('');
      setMessage('');
      setTarget('');
      setScrollToId('');
      setImportant(false);
      setNotifyEmail(true);
      setNotifySms(true);
      setPublished(true);
    } catch (err) {
      toast.error(err.message || 'Failed to publish notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Notifications" subtitle="Push alerts to members">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
            <Bell className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Publish a notification
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Appears in the header bell for all members. Optionally link to a page in the app.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label htmlFor="notif-title" className="mb-1 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="notif-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm"
                placeholder="Short headline"
                required
              />
            </div>

            <div>
              <label htmlFor="notif-message" className="mb-1 block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                id="notif-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="input-field resize-none text-sm"
                placeholder="What members should know…"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="notif-type" className="mb-1 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  id="notif-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field text-sm"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="notif-target" className="mb-1 block text-sm font-medium text-slate-700">
                  Link (optional)
                </label>
                <input
                  id="notif-target"
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="/events"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_PATHS.map((q) => (
                    <button
                      key={q.path}
                      type="button"
                      onClick={() => setTarget(q.path)}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="notif-scroll" className="mb-1 block text-sm font-medium text-slate-700">
                Scroll anchor id (optional)
              </label>
              <input
                id="notif-scroll"
                type="text"
                value={scrollToId}
                onChange={(e) => setScrollToId(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="element-id on that page"
              />
            </div>

            <div className="space-y-3 rounded-lg border border-gray-100 bg-slate-50/80 px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Show in the app bell (published)
              </label>
              <label
                className={`flex cursor-pointer items-center gap-2.5 text-sm ${
                  important ? 'font-medium text-amber-900' : 'text-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Mark as important (email/SMS if configured on server)
              </label>
              {important && (
                <div className="ml-7 space-y-2 border-t border-gray-200/80 pt-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Send email alerts
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Send SMS alerts
                  </label>
                </div>
              )}
            </div>

            {important && (
              <div className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Email and SMS require SendGrid/Twilio env vars on Railway. In-app bell works without them.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-slate-50/50 px-5 py-4 sm:px-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publish notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
