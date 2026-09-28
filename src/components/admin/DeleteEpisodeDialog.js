import React, { useEffect } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

const DeleteEpisodeDialog = ({
  open,
  episode,
  coverUrl,
  categoryLabel,
  deleting,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, deleting, onCancel]);

  if (!open || !episode) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-episode-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Close dialog"
        disabled={deleting}
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-start gap-4 border-b border-gray-100 px-5 py-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="delete-episode-title" className="text-base font-semibold text-slate-900">
              Delete episode?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This permanently removes the episode and its audio. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 px-5 py-4">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200" />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Trash2 className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">{episode.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {categoryLabel}
              {episode.host ? ` · ${episode.host}` : ''}
              {episode.duration ? ` · ${episode.duration}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete episode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEpisodeDialog;
