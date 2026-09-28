import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Headphones,
  Upload,
  Loader2,
  Trash2,
  Edit,
  FileAudio,
  X,
  Music,
} from 'lucide-react';
import { podcastService, RESOLVED_API_BASE_URL } from '../../services/apiService';
import toast from 'react-hot-toast';
import { PODCAST_CATEGORIES, getCategoryCoverPath } from '../../constants/podcastCovers';
import AdminLayout from '../../components/AdminLayout';
import DeleteEpisodeDialog from '../../components/admin/DeleteEpisodeDialog';

const DEFAULT_HOST = 'Noble Masvingise';

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function probeAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    const cleanup = () => URL.revokeObjectURL(url);
    audio.onloadedmetadata = () => {
      cleanup();
      resolve(audio.duration);
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Could not read audio file'));
    };
    audio.src = url;
  });
}

function resolveCoverUrl(coverPath, category) {
  const path = getCategoryCoverPath(category) || coverPath;
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('/images/')) return path;
  if (path.startsWith('/') && (path.startsWith('/storage/') || path.startsWith('/uploads/'))) {
    return `${RESOLVED_API_BASE_URL}${path}`;
  }
  return `${RESOLVED_API_BASE_URL}/uploads/podcasts/${path}`;
}

const emptyForm = () => ({
  title: '',
  host: DEFAULT_HOST,
  type: 'episode',
  category: 'spiritual-development',
  description: '',
  duration: '',
  is_live: false,
  is_free: true,
  audio_file: null,
});

const AdminPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [probingDuration, setProbingDuration] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const fileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = PODCAST_CATEGORIES;
  const categoryCoverPreview = getCategoryCoverPath(formData.category);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const data = await podcastService.getPodcasts();
      setPodcasts(data);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast.error('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(emptyForm());
    setEditingPodcast(null);
    setProbingDuration(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const pickAudioFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|wav|ogg|aac|mp4)$/i.test(file.name)) {
      toast.error('Please choose an audio file (MP3, M4A, WAV, etc.)');
      return;
    }
    setFormData((prev) => ({ ...prev, audio_file: file, duration: '' }));
    setProbingDuration(true);
    try {
      const seconds = await probeAudioDuration(file);
      const formatted = formatDuration(seconds);
      setFormData((prev) => ({ ...prev, audio_file: file, duration: formatted || '' }));
    } catch {
      toast.error('Could not detect duration — it will be retried on publish.');
    } finally {
      setProbingDuration(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    void pickAudioFile(e.dataTransfer.files?.[0]);
  };

  const resolveDuration = async () => {
    if (formData.duration?.trim()) return formData.duration.trim();
    if (formData.audio_file) {
      try {
        const seconds = await probeAudioDuration(formData.audio_file);
        return formatDuration(seconds);
      } catch {
        return null;
      }
    }
    if (editingPodcast?.duration) return editingPodcast.duration;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = formData.title.trim();
    if (!title) {
      toast.error('Episode title is required.');
      return;
    }
    if (!formData.audio_file && !editingPodcast?.audio_url) {
      toast.error('Add an audio file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      let audioUrl = editingPodcast?.audio_url || null;

      if (formData.audio_file) {
        setSubmitStep('Uploading audio…');
        const audioUploadResult = await podcastService.uploadPodcastAudio(formData.audio_file);
        audioUrl = audioUploadResult.url;
      }

      setSubmitStep('Saving episode…');
      const duration = await resolveDuration();

      const podcastData = {
        title,
        host: formData.host.trim() || DEFAULT_HOST,
        type: formData.type,
        category: formData.category,
        description: formData.description.trim() || title,
        duration,
        is_live: formData.is_live,
        is_free: formData.is_free,
        tags: null,
        audio_url: audioUrl,
        transcript: null,
        cover: getCategoryCoverPath(formData.category),
      };

      if (editingPodcast) {
        await podcastService.updatePodcast(editingPodcast.id, podcastData);
        toast.success('Episode updated!');
      } else {
        await podcastService.createPodcast(podcastData);
        toast.success('Episode published!');
      }

      resetForm();
      loadPodcasts();
    } catch (error) {
      console.error('Error saving podcast:', error);
      toast.error(error.message || 'Failed to save episode');
    } finally {
      setSubmitting(false);
      setSubmitStep('');
    }
  };

  const handleEdit = (podcast) => {
    setEditingPodcast(podcast);
    setFormData({
      title: podcast.title || '',
      host: podcast.host || DEFAULT_HOST,
      type: podcast.type || 'episode',
      category: podcast.category || 'spiritual-development',
      description: podcast.description || '',
      duration: podcast.duration || '',
      is_live: podcast.is_live || false,
      is_free: podcast.is_free !== undefined ? podcast.is_free : true,
      audio_file: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (podcast) => {
    setDeleteTarget(podcast);
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await podcastService.deletePodcast(deleteTarget.id);
      toast.success('Episode deleted');
      if (editingPodcast?.id === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      loadPodcasts();
    } catch (error) {
      console.error('Error deleting podcast:', error);
      const msg = error.message || 'Failed to delete episode';
      if (/Not enough permissions/i.test(msg)) {
        toast.error(
          'Your PostgreSQL admin flag is missing. In Railway Postgres run: UPDATE users SET is_admin = true WHERE email = \'your@email.com\'; then sign out and sign in again.'
        );
      } else if (/Could not validate credentials|Invalid or expired credentials|Admin API rejected/i.test(msg)) {
        toast.error(
          'Sign out, sign in again (same email/password), then retry delete. If it persists, set is_admin=true on your user in PostgreSQL.'
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || id;

  if (loading) {
    return (
      <AdminLayout title="Upload Podcasts" subtitle="Add new episodes">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Upload Podcasts"
      subtitle="Add new episodes"
      onRefresh={loadPodcasts}
      refreshing={loading}
      mainClassName="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y p-0 lg:overflow-hidden"
    >
      <div className="border-b border-gray-200 bg-white px-5 py-4 shadow-sm sm:px-7 lg:flex-shrink-0">
        <div className="mb-3">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {editingPodcast ? 'Edit episode' : 'Upload a new episode'}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Drop audio, set title &amp; category — cover and duration are set automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr_1fr]">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !formData.audio_file && fileInputRef.current?.click()}
              className={[
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors lg:min-h-[180px]',
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-slate-50',
                formData.audio_file ? 'border-primary-300 bg-primary-50' : '',
              ].join(' ')}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.mp4"
                className="hidden"
                onChange={(e) => void pickAudioFile(e.target.files?.[0])}
              />
              {formData.audio_file ? (
                <>
                  <FileAudio className="h-8 w-8 text-primary-600" />
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-900">{formData.audio_file.name}</p>
                  <p className="mt-0.5 text-[11px] text-primary-700">
                    {(formData.audio_file.size / 1024 / 1024).toFixed(1)} MB
                    {probingDuration && ' · detecting length…'}
                    {!probingDuration && formData.duration && ` · ${formData.duration}`}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, audio_file: null, duration: '' }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                      className="mt-1 text-[11px] font-medium text-slate-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </>
              ) : editingPodcast?.audio_url ? (
                <>
                  <FileAudio className="h-8 w-8 text-primary-500" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">Current audio on file</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formData.duration || editingPodcast.duration || 'Drop a new file to replace'}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-primary-500" />
                  <p className="mt-2 text-xs font-semibold text-slate-900">Drop audio or browse</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">MP3, M4A, WAV…</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              {editingPodcast && (
                <div className="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-1.5 text-xs text-primary-800">
                  <span className="truncate">Editing: <strong>{editingPodcast.title}</strong></span>
                  <button type="button" onClick={resetForm} className="ml-2 flex-shrink-0 text-primary-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Episode title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Seven Keys to Unlocking Greatness"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Category *</label>
                <div className="flex gap-2">
                  {categoryCoverPreview && (
                    <img
                      src={categoryCoverPreview}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                    />
                  )}
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="input-field min-w-0 flex-1 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Cover art uses this category image</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Host</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-2 xl:col-span-1">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Optional — defaults to title"
                  className="input-field resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || probingDuration}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {submitStep || 'Working…'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {editingPodcast ? 'Save changes' : 'Publish episode'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="px-5 py-4 sm:px-7 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            Published episodes
            <span className="ml-2 text-sm font-normal text-slate-500">({podcasts.length})</span>
          </h2>

          {podcasts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
              <Music className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No episodes yet</p>
              <p className="mt-1 text-xs text-slate-500">Use the form above to upload your first episode</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {podcasts.map((podcast) => {
                const cover = resolveCoverUrl(podcast.cover, podcast.category);
                return (
                  <li key={podcast.id} className="flex gap-4 p-4 hover:bg-slate-50/80">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50">
                        <Headphones className="h-6 w-6 text-primary-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{podcast.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {categoryName(podcast.category)} · {podcast.host}
                        {podcast.duration ? ` · ${podcast.duration}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(podcast)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(podcast)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <DeleteEpisodeDialog
        open={Boolean(deleteTarget)}
        episode={deleteTarget}
        coverUrl={deleteTarget ? resolveCoverUrl(deleteTarget.cover, deleteTarget.category) : ''}
        categoryLabel={deleteTarget ? categoryName(deleteTarget.category) : ''}
        deleting={deleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </AdminLayout>
  );
};

export default AdminPodcasts;
