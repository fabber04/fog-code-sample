import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Download, Headphones, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import { usePodcastBookmarks } from '../contexts/PodcastBookmarksContext';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { getCategoryDisplayName } from '../constants/podcastCovers';
import { downloadPodcastAudio } from '../utils/podcastDownload';

const Bookmarks = () => {
  const { bookmarks, removeBookmark } = usePodcastBookmarks();
  const { playPodcast } = useAudioPlayer();

  const handlePlay = (podcast) => {
    if (!podcast.audioUrl) {
      toast.error('No audio available for this episode');
      return;
    }
    playPodcast(podcast);
  };

  const handleDownload = (podcast) => {
    if (!downloadPodcastAudio(podcast)) {
      toast.error('No audio available for download');
    }
  };

  const handleRemove = (podcast) => {
    removeBookmark(podcast.id);
    toast.success('Removed from bookmarks');
  };

  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-slate-50 lg:py-8">
      <MobilePageHeader
        title="Bookmarks"
        icon={Bookmark}
        rightSlot={<MobilePageNotificationBell />}
      />

      <div className="lg:hidden px-4 pt-4 pb-8">
        <p className="mb-4 text-sm text-slate-500">
          {bookmarks.length}{' '}
          {bookmarks.length === 1 ? 'saved episode' : 'saved episodes'}
        </p>

        {bookmarks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No bookmarked podcasts yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Tap the bookmark icon on any episode to save it here.
            </p>
            <Link
              to="/podcasts"
              className="mt-4 inline-flex rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white"
            >
              Browse podcasts
            </Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
            {bookmarks.map((podcast) => (
              <li
                key={podcast.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => handlePlay(podcast)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block text-sm font-medium leading-snug text-slate-900">
                    {podcast.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {getCategoryDisplayName(podcast.category)}
                    {podcast.duration && podcast.duration !== 'N/A'
                      ? ` · ${podcast.duration}`
                      : ''}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlay(podcast)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  title="Play"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(podcast)}
                  className="shrink-0 rounded-lg p-2 text-[#2563eb] transition-colors hover:bg-blue-50"
                  title="Remove bookmark"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(podcast)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mx-auto hidden max-w-3xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bookmarked Podcasts</h1>
          <p className="mt-2 text-slate-600">
            Your saved episodes — play or download anytime.
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <Headphones className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-700">No bookmarked podcasts yet.</p>
            <Link
              to="/podcasts"
              className="mt-4 inline-flex rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8]"
            >
              Browse podcasts
            </Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
            {bookmarks.map((podcast) => (
              <li
                key={podcast.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => handlePlay(podcast)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block font-medium text-slate-900">{podcast.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {getCategoryDisplayName(podcast.category)}
                    {podcast.host ? ` · ${podcast.host}` : ''}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePlay(podcast)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Play"
                >
                  <Play className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(podcast)}
                  className="rounded-lg p-2 text-[#2563eb] hover:bg-blue-50"
                  title="Remove bookmark"
                >
                  <Bookmark className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(podcast)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
