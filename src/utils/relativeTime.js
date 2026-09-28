export function formatRelativeFromMaybeTimestamp(ts) {
  if (!ts || typeof ts.toDate !== 'function') return '';

  const d = ts.toDate();
  const ms = Date.now() - d.getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'Just now';

  const secs = Math.floor(ms / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins === 1 ? '1 min ago' : `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
