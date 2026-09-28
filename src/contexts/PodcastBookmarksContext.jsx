import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'fog_podcast_bookmarks';

const PodcastBookmarksContext = createContext(null);

function normalizeBookmark(podcast) {
  return {
    id: podcast.id,
    title: podcast.title || 'Untitled episode',
    host: podcast.host || '',
    category: podcast.category || '',
    cover: podcast.cover || '',
    audioUrl: podcast.audioUrl || '',
    duration: podcast.duration || 'N/A',
    publishDate: podcast.publishDate || '',
    bookmarkedAt: new Date().toISOString(),
  };
}

export function PodcastBookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setBookmarks(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (podcastId) => bookmarks.some((item) => item.id === podcastId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((podcast) => {
    if (!podcast?.id) return;
    setBookmarks((prev) => {
      const exists = prev.some((item) => item.id === podcast.id);
      if (exists) {
        return prev.filter((item) => item.id !== podcast.id);
      }
      return [normalizeBookmark(podcast), ...prev.filter((item) => item.id !== podcast.id)];
    });
  }, []);

  const removeBookmark = useCallback((podcastId) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== podcastId));
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      bookmarkCount: bookmarks.length,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
    }),
    [bookmarks, isBookmarked, toggleBookmark, removeBookmark]
  );

  return (
    <PodcastBookmarksContext.Provider value={value}>
      {children}
    </PodcastBookmarksContext.Provider>
  );
}

export function usePodcastBookmarks() {
  const ctx = useContext(PodcastBookmarksContext);
  if (!ctx) {
    throw new Error('usePodcastBookmarks must be used within PodcastBookmarksProvider');
  }
  return ctx;
}
