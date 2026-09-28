import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Headphones, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Calendar,
  User,
  Tag,
  Radio,
  Download,
  Bookmark,
  Star,
  BookOpen,
  Users,
  GraduationCap,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import MobileListCard from '../components/mobile/MobileListCard';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { podcastService, getResolvedApiBaseUrl } from '../services/apiService';
import {
  PODCAST_CATEGORIES,
  normalizeCategory,
  getCategoryCoverPath,
} from '../constants/podcastCovers';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileFilterPill from '../components/mobile/MobileFilterPill';
import { usePodcastBookmarks } from '../contexts/PodcastBookmarksContext';
import { downloadPodcastAudio } from '../utils/podcastDownload';

const PODCAST_FILTER_OPTIONS = [
  { id: 'all', name: 'All Categories' },
  ...PODCAST_CATEGORIES.map(({ id, name }) => ({ id, name })),
];

/** Shared slate palette — matches Layout sidebar / header chrome */
const PODCAST = {
  page: 'bg-white lg:bg-slate-50',
  card: 'border border-slate-200 bg-white shadow-sm',
  cardHeader: 'border-b border-slate-200 bg-slate-50',
  muted: 'text-slate-500',
  body: 'text-slate-600',
  title: 'text-slate-900',
  rowHover: 'hover:bg-slate-50',
  rowActive: 'bg-slate-100/90',
  badge: 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800',
  badgeActive: 'bg-slate-200 text-slate-800',
  icon: 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
  iconActive: 'text-slate-600 hover:bg-slate-200 hover:text-slate-800',
  cta: 'bg-slate-800 text-white hover:bg-slate-900',
  spinner: 'text-slate-500',
  placeholder: 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200',
  input:
    'border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-300',
};

/** Episodes published within this window show the "New" badge (until played). */
const NEW_EPISODE_WINDOW_DAYS = 7;

const isRecentlyPublished = (publishDate) => {
  if (!publishDate) return false;
  const published = new Date(publishDate);
  if (Number.isNaN(published.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NEW_EPISODE_WINDOW_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  return published >= cutoff;
};

const Podcasts = () => {
  const location = useLocation();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { playPodcast } = useAudioPlayer();
  const { isBookmarked, toggleBookmark } = usePodcastBookmarks();

  const validCategoryIds = useMemo(
    () => new Set(PODCAST_CATEGORIES.map((category) => category.id)),
    []
  );
  const selectedCategory =
    categoryId && validCategoryIds.has(categoryId) ? categoryId : null;
  
  // Ensure this is the public podcasts page, not admin
  useEffect(() => {
    // Redirect if somehow on admin route
    if (location.pathname && location.pathname.includes('/admin/podcasts')) {
      console.warn('Warning: Public Podcasts component loaded but URL suggests admin route');
      // This shouldn't happen, but safeguard just in case
    }
  }, [location.pathname]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPlayedPodcastId, setLastPlayedPodcastId] = useState(null);
  const [playedPodcastIds, setPlayedPodcastIds] = useState(() => new Set());
  const [apiError, setApiError] = useState(null);

  const openCategory = useCallback(
    (id) => navigate(`/podcasts/${id}`),
    [navigate]
  );
  const closeCategory = useCallback(() => navigate('/podcasts'), [navigate]);

  useEffect(() => {
    if (!selectedCategory) return;
    requestAnimationFrame(() => {
      const scrollRoot = document.querySelector('main') || document.documentElement;
      scrollRoot.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [selectedCategory]);

  const getCategoryCoverImage = (category) => getCategoryCoverPath(category);

  // Extract episode number from title (e.g., "Episode 01", "Episode 3", "Ep 1", "Esp.4")
  const getEpisodeNumber = (title = '') => {
    // Try to match "Episode 01", "Episode 1", "Ep 01", etc.
    const match = title.match(/(?:ep|eps|esp|episode)[\s.-]*#?\s*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    // Also try to match at the start of title (e.g., "Episode 01: Title")
    const startMatch = title.match(/^episode\s+(\d+)/i);
    if (startMatch) {
      return parseInt(startMatch[1], 10);
    }
    return null;
  };

  // Sort episodes so earliest numbers (or dates) appear first
  const sortEpisodes = useCallback((list = []) => {
    return [...list].sort((a, b) => {
      const aNum = getEpisodeNumber(a.title);
      const bNum = getEpisodeNumber(b.title);

      if (aNum !== null && bNum !== null && aNum !== bNum) return aNum - bNum;
      if (aNum !== null && bNum === null) return -1;
      if (aNum === null && bNum !== null) return 1;

      const aDate = new Date(a.publishDate || a.created_at || 0);
      const bDate = new Date(b.publishDate || b.created_at || 0);
      if (!isNaN(aDate) && !isNaN(bDate) && aDate.getTime() !== bDate.getTime()) {
        return aDate - bDate;
      }

      return (a.id || 0) - (b.id || 0);
    });
  }, []);

  // Load last played + full played history from localStorage
  useEffect(() => {
    const lastPlayed = localStorage.getItem('fog_last_played_podcast_id');
    if (lastPlayed) {
      setLastPlayedPodcastId(parseInt(lastPlayed, 10));
    }
    try {
      const stored = localStorage.getItem('fog_played_podcast_ids');
      if (stored) {
        setPlayedPodcastIds(new Set(JSON.parse(stored)));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Fetch podcasts from API
  useEffect(() => {
    const loadPodcasts = async () => {
      const apiBase = getResolvedApiBaseUrl();
      try {
        setLoading(true);
        const data = await podcastService.getPodcasts();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Podcasts data is not an array:', data);
          setPodcasts([]);
          return;
        }
        
        if (data.length === 0) {
          setPodcasts([]);
          return;
        }
        
        // Map API response to component format
        const mappedPodcasts = data.map(podcast => {
          const normalizedCategory = normalizeCategory(podcast.category);
          // Helper to build full URL
          const buildUrl = (url) => {
            if (!url || url === '#' || url === 'null' || url === 'undefined') return null;
            // If already a full URL, return as-is
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            // If relative URL, make it absolute
            if (url.startsWith('/')) {
              return `${apiBase}${url}`;
            }
            // If it's a Google Drive link, return as-is
            if (url.includes('drive.google.com')) return url;
            // Otherwise, assume it's a relative path
            return `${apiBase}/${url}`;
          };
          
          const coverImage = getCategoryCoverImage(normalizedCategory);
          const audioUrl = buildUrl(podcast.audio_url);
          if (!audioUrl) {
            console.warn(`Podcast "${podcast.title}" (ID: ${podcast.id}) has no audio_url`);
          }
          
          return {
            id: podcast.id,
            title: podcast.title,
            host: podcast.host,
            type: podcast.type,
            category: normalizedCategory,
            description: podcast.description,
            cover: coverImage,
            duration: podcast.duration || 'N/A',
            publishDate: podcast.publish_date ? podcast.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
            isLive: podcast.is_live || false,
            isFree: podcast.is_free !== undefined ? podcast.is_free : true,
            rating: podcast.rating || 0,
            plays: podcast.plays || 0,
            tags: podcast.tags ? (typeof podcast.tags === 'string' ? podcast.tags.split(',').map(t => t.trim()) : podcast.tags) : [],
            audioUrl: audioUrl,
            transcript: podcast.transcript || ''
          };
        });
        // Sort so Episode 1 starts at the top
        const sortedPodcasts = sortEpisodes(mappedPodcasts);
        setPodcasts(sortedPodcasts);
      } catch (error) {
        console.error('Error loading podcasts:', error);
        
        // Set error message for user
        const errorMessage = error.message || 'Unknown error';
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Cannot connect')) {
          setApiError(`Cannot connect to backend API at ${apiBase}. Please check if the server is running.`);
        } else {
          setApiError(`Error loading podcasts: ${errorMessage}`);
        }
        
        setPodcasts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPodcasts();
  }, [sortEpisodes]);

  const ORIGINAL_CATEGORIES = PODCAST_CATEGORIES.map(({ id, name }) => ({ id, name }));

  // Group podcasts by original categories only
  const getCategoryInfo = () => {
    const categoryMap = {};
    
    // Initialize all original categories with default covers
    ORIGINAL_CATEGORIES.forEach(cat => {
      categoryMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        podcasts: [],
        cover: getCategoryCoverImage(cat.id) // Use local image as default
      };
    });
    
    // Only add podcasts that belong to original categories (after normalization)
    podcasts.forEach(podcast => {
      if (!podcast.category) {
        console.warn(`⚠️ Podcast "${podcast.title}" (ID: ${podcast.id}) has no category`);
        return;
      }
      const normalized = normalizeCategory(podcast.category);
      
      if (categoryMap[normalized]) {
        const withNormalized = { ...podcast, category: normalized };
        categoryMap[normalized].podcasts.push(withNormalized);
      } else {
        console.warn(
          `Podcast "${podcast.title}" (ID: ${podcast.id}) category "${podcast.category}" does not match a known category`
        );
      }
    });
    
    // Sort podcasts within each category so Episode 1 shows first
    Object.values(categoryMap).forEach(cat => {
      cat.podcasts = sortEpisodes(cat.podcasts);
    });
    
    // Return only original categories (even if they have no podcasts)
    return ORIGINAL_CATEGORIES.map(cat => categoryMap[cat.id]);
  };

  const categories = getCategoryInfo();
  
  // Get episodes for selected category
  const getCategoryEpisodes = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.podcasts : [];
  };

  const markPodcastPlayed = (podcastId) => {
    if (!podcastId) return;
    setPlayedPodcastIds((prev) => {
      if (prev.has(podcastId)) return prev;
      const next = new Set(prev);
      next.add(podcastId);
      localStorage.setItem('fog_played_podcast_ids', JSON.stringify([...next]));
      return next;
    });
  };

  const getEpisodeLabels = useCallback((podcast, categoryPodcasts) => {
    if (!categoryPodcasts?.length) return [];
    const labels = [];

    if (
      isRecentlyPublished(podcast.publishDate) &&
      !playedPodcastIds.has(podcast.id)
    ) {
      labels.push({ key: 'new', label: 'New', className: 'bg-sky-100 text-sky-700' });
    }

    const byPlays = [...categoryPodcasts].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    const topPlays = byPlays[0]?.plays || 0;
    if (topPlays > 0) {
      const popularIds = byPlays.filter((p) => (p.plays || 0) > 0).slice(0, 3).map((p) => p.id);
      if (popularIds.includes(podcast.id)) {
        labels.push({ key: 'popular', label: 'Popular', className: 'bg-amber-100 text-amber-800' });
      }
    }

    return labels;
  }, [playedPodcastIds]);

  const handlePlay = (podcast) => {
    setSelectedPodcast(podcast);

    if (podcast.id) {
      setLastPlayedPodcastId(podcast.id);
      markPodcastPlayed(podcast.id);
    }

    playPodcast(podcast);

    if (!podcast.audioUrl || podcast.audioUrl === '#' || podcast.audioUrl === 'null' || podcast.audioUrl === 'undefined') {
      console.warn('No audio URL available for podcast:', podcast.title, 'audioUrl:', podcast.audioUrl);
    }
  };

  const handleDownload = (podcast) => {
    if (!downloadPodcastAudio(podcast)) {
      alert('No audio available for download');
    }
  };

  const handleBookmark = useCallback(
    (podcast) => {
      const saved = isBookmarked(podcast.id);
      toggleBookmark(podcast);
      toast.success(saved ? 'Removed from bookmarks' : 'Saved to bookmarks');
    },
    [isBookmarked, toggleBookmark]
  );

  const longPressTimerRef = useRef(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const startLongPressBookmark = useCallback(
    (podcast) => {
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        handleBookmark(podcast);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(12);
        }
      }, 600);
    },
    [clearLongPress, handleBookmark]
  );

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const handlePurchase = (podcast) => {
    // All podcasts are free - no payment needed
    handlePlay(podcast);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'episode':
        return <Headphones className="w-5 h-5" />;
      case 'live':
        return <Radio className="w-5 h-5" />;
      case 'series':
        return <Bookmark className="w-5 h-5" />;
      default:
        return <Headphones className="w-5 h-5" />;
    }
  };


  const getCategoryIcon = (category) => {
    switch (category) {
      case 'spiritual-development':
        return <Star className="w-3 h-3" />;
      case 'relationships':
        return <Heart className="w-3 h-3" />;
      case 'personal-development':
        return <User className="w-3 h-3" />;
      case 'wisdom-keys':
        return <BookOpen className="w-3 h-3" />;
      case 'beyond-dating-game':
        return <MessageCircle className="w-3 h-3" />;
      case 'wisdom-for-ladies':
        return <Heart className="w-3 h-3" />;
      case 'teens':
        return <Users className="w-3 h-3" />;
      case 'university-students':
        return <GraduationCap className="w-3 h-3" />;
      default:
        return <Headphones className="w-3 h-3" />;
    }
  };

  const formatTime = (time) => {
    if (time === 'Live' || time === 'Series') return time;
    return time;
  };

  const searchQuery = searchTerm.trim().toLowerCase();

  const podcastMatchesSearch = useCallback(
    (podcast, query) => {
      const categoryName = categories.find((c) => c.id === podcast.category)?.name || '';
      const haystack = [
        podcast.title,
        podcast.host,
        podcast.description,
        categoryName,
        ...(Array.isArray(podcast.tags) ? podcast.tags : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      return terms.every((term) => haystack.includes(term));
    },
    [categories]
  );

  const visiblePodcastSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    return sortEpisodes(
      podcasts.filter((podcast) => {
        if (filterCategory !== 'all' && podcast.category !== filterCategory) return false;
        return podcastMatchesSearch(podcast, searchQuery);
      })
    );
  }, [podcasts, searchQuery, filterCategory, podcastMatchesSearch, sortEpisodes]);

  const visibleCategories = categories.filter((category) => {
    if (filterCategory !== 'all' && category.id !== filterCategory) return false;
    if (searchQuery) {
      return (
        category.name.toLowerCase().includes(searchQuery) ||
        category.podcasts.some((p) => podcastMatchesSearch(p, searchQuery))
      );
    }
    return true;
  });

  const renderEpisodeRow = (podcast, index, categoryPodcasts = null) => {
    const isLastPlayed = lastPlayedPodcastId === podcast.id;
    const isPlayed = playedPodcastIds.has(podcast.id);
    const categoryName = categories.find((c) => c.id === podcast.category)?.name;
    const pool =
      categoryPodcasts ||
      categories.find((c) => c.id === podcast.category)?.podcasts ||
      [];
    const labels = getEpisodeLabels(podcast, pool);
    const isSaved = isBookmarked(podcast.id);

    const rowClass = isLastPlayed
      ? 'bg-emerald-50/90 border-l-2 border-l-emerald-400'
      : isSaved
        ? 'bg-blue-50/40 border-l-2 border-l-[#2563eb]'
        : isPlayed
          ? 'bg-slate-100/80'
          : PODCAST.rowHover;

    const badgeClass = isLastPlayed
      ? 'bg-emerald-200 text-emerald-800'
      : isPlayed
        ? 'bg-slate-200 text-slate-500'
        : PODCAST.badge;

    const titleClass = isLastPlayed
      ? 'text-emerald-900'
      : isPlayed
        ? 'text-slate-500'
        : PODCAST.title;

    return (
      <li
        key={podcast.id}
        className={`group flex items-center gap-3 px-4 py-3.5 transition-colors sm:gap-4 sm:px-5 sm:py-4 lg:px-6 ${rowClass}`}
        onTouchStart={() => startLongPressBookmark(podcast)}
        onTouchEnd={clearLongPress}
        onTouchMove={clearLongPress}
        onTouchCancel={clearLongPress}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${badgeClass}`}
        >
          {index + 1}
        </span>
        <button type="button" onClick={() => handlePlay(podcast)} className="min-w-0 flex-1 text-left">
          <span className={`block text-sm font-medium leading-snug sm:text-[15px] ${titleClass}`}>
            {podcast.title}
            {isLastPlayed && (
              <span className="ml-2 text-xs font-normal text-emerald-600">(Last played)</span>
            )}
            {isPlayed && !isLastPlayed && (
              <span className={`ml-2 text-xs font-normal ${PODCAST.muted}`}>(Played)</span>
            )}
          </span>
          {(categoryName || labels.length > 0) && (
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {categoryName && !categoryPodcasts && (
                <span className={`text-xs ${PODCAST.muted}`}>{categoryName}</span>
              )}
              {labels.map((tag) => (
                <span
                  key={tag.key}
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-xs ${tag.className}`}
                >
                  {tag.label}
                </span>
              ))}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePlay(podcast);
          }}
          className={`shrink-0 rounded-lg p-2 transition-colors ${PODCAST.icon}`}
          title="Play podcast"
        >
          <Play className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark(podcast);
          }}
          className={`hidden shrink-0 rounded-lg p-2 transition-colors lg:flex ${
            isSaved ? 'text-[#2563eb] hover:bg-blue-50' : PODCAST.icon
          }`}
          title={isSaved ? 'Remove bookmark' : 'Save to bookmarks'}
          aria-pressed={isSaved}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(podcast);
          }}
          className={`shrink-0 rounded-lg p-2 transition-colors ${
            isLastPlayed ? PODCAST.iconActive : PODCAST.icon
          }`}
          title="Download podcast"
        >
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </li>
    );
  };

  if (categoryId && !selectedCategory) {
    return <Navigate to="/podcasts" replace />;
  }

  // If a category is selected, show episode list view
  if (selectedCategory) {
    const categoryEpisodes = getCategoryEpisodes();
    const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);
    
    return (
      <div className={`flex min-h-full flex-col ${PODCAST.page} lg:h-[calc(100dvh-3.5rem-3rem)] lg:min-h-0 lg:overflow-hidden`}>
        <MobilePageHeader
          title={selectedCategoryInfo?.name || 'Podcasts'}
          icon={Headphones}
          onBack={closeCategory}
          backLabel="Back to categories"
          rightSlot={<MobilePageNotificationBell />}
        />

        <div className="lg:hidden px-4 pt-4 pb-8">
          <p className={`mb-1 text-sm ${PODCAST.muted}`}>
            {categoryEpisodes.length}{' '}
            {categoryEpisodes.length === 1 ? 'episode' : 'episodes'} available
          </p>
          <p className={`mb-4 text-xs ${PODCAST.muted}`}>
            Hold an episode to bookmark
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`h-8 w-8 animate-spin ${PODCAST.spinner}`} />
            </div>
          ) : categoryEpisodes.length === 0 ? (
            <p className={`py-12 text-center text-sm ${PODCAST.muted}`}>No episodes in this category yet.</p>
          ) : (
            <ul className={`overflow-hidden rounded-xl divide-y divide-slate-100 ${PODCAST.card}`}>
              {categoryEpisodes.map((podcast, index) =>
                renderEpisodeRow(podcast, index, categoryEpisodes)
              )}
            </ul>
          )}
        </div>

        <div className="mx-auto hidden w-full max-w-4xl flex-1 flex-col lg:flex lg:min-h-0 lg:px-2">
          <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl ${PODCAST.card}`}>
            <header className={`shrink-0 px-6 py-5 ${PODCAST.cardHeader}`}>
              <button
                type="button"
                onClick={closeCategory}
                className={`mb-3 inline-flex items-center text-sm font-medium ${PODCAST.muted} transition-colors hover:text-slate-800`}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Categories
              </button>

              <h1 className={`text-xl font-bold leading-snug sm:text-2xl ${PODCAST.title}`}>
                {selectedCategoryInfo ? selectedCategoryInfo.name : 'Podcasts'}
              </h1>
              <p className={`mt-0.5 text-sm ${PODCAST.muted}`}>Messages &amp; Audio Sermons</p>
              <p className={`mt-2 text-sm font-medium ${PODCAST.body}`}>
                {categoryEpisodes.length} {categoryEpisodes.length === 1 ? 'episode' : 'episodes'} available
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className={`h-8 w-8 animate-spin ${PODCAST.spinner}`} />
                  <span className={`ml-3 ${PODCAST.body}`}>Loading episodes...</span>
                </div>
              ) : apiError ? (
                <div className="px-6 py-16 text-center">
                  <Headphones className={`mx-auto mb-4 h-12 w-12 ${PODCAST.muted}`} />
                  <p className={PODCAST.body}>Unable to load episodes due to API connection error</p>
                  <p className={`mt-2 text-sm ${PODCAST.muted}`}>Please check the backend server status</p>
                  <button
                    onClick={() => {
                      setApiError(null);
                      window.location.reload();
                    }}
                    className={`mt-4 rounded-lg px-4 py-2 ${PODCAST.cta}`}
                  >
                    Retry Connection
                  </button>
                </div>
              ) : categoryEpisodes.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Headphones className={`mx-auto mb-4 h-12 w-12 ${PODCAST.muted}`} />
                  <p className={PODCAST.body}>No episodes found in this category</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {categoryEpisodes.map((podcast, index) =>
                    renderEpisodeRow(podcast, index, categoryEpisodes)
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Default view: Show category covers
  return (
    <div className={`min-h-full ${PODCAST.page} lg:min-h-screen lg:py-8`}>
      <MobilePageHeader title="Podcasts" icon={Headphones} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <MobileFilterPill
          value={filterCategory}
          onChange={setFilterCategory}
          options={PODCAST_FILTER_OPTIONS}
          label="Filter podcast categories"
        />
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${PODCAST.muted}`} />
            <input
              type="search"
              placeholder="Search by podcast name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${PODCAST.input}`}
            />
          </div>
        </div>
        <div className="px-4 pt-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`h-8 w-8 animate-spin ${PODCAST.spinner}`} />
            </div>
          ) : apiError ? (
            <p className="py-12 text-center text-sm text-red-600">{apiError}</p>
          ) : searchQuery ? (
            visiblePodcastSearchResults.length === 0 ? (
              <p className={`py-12 text-center text-sm ${PODCAST.muted}`}>
                No podcasts found for &ldquo;{searchTerm.trim()}&rdquo;
              </p>
            ) : (
              <>
                <p className={`mb-3 text-sm ${PODCAST.muted}`}>
                  {visiblePodcastSearchResults.length}{' '}
                  {visiblePodcastSearchResults.length === 1 ? 'result' : 'results'}
                </p>
                <ul className={`overflow-hidden rounded-xl divide-y divide-slate-100 ${PODCAST.card}`}>
                  {visiblePodcastSearchResults.map((podcast, index) =>
                    renderEpisodeRow(podcast, index)
                  )}
                </ul>
              </>
            )
          ) : visibleCategories.length === 0 ? (
            <p className={`py-12 text-center text-sm ${PODCAST.muted}`}>No categories found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {visibleCategories.map((category) => (
                <MobileListCard
                  key={category.id}
                  compact
                  image={category.cover}
                  imageAlt={category.name}
                  imageClassName="aspect-square w-full"
                  imageFit="cover"
                  title={category.name}
                  subtitle={category.podcasts.length === 0 ? 'Coming soon' : undefined}
                  onClick={() => openCategory(category.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${PODCAST.title}`}>FOG Podcasts</h1>
          <p className={`mt-2 ${PODCAST.body}`}>
            Listen to inspiring messages, wisdom keys, and spiritual content across all life stages
          </p>
        </div>

        <div className={`mb-6 rounded-xl p-6 ${PODCAST.card}`}>
          <div className="relative">
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${PODCAST.muted}`} />
            <input
              type="search"
              placeholder="Search by podcast name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full rounded-lg border py-2 pl-10 pr-3 leading-5 focus:outline-none focus:ring-2 ${PODCAST.input}`}
            />
          </div>
        </div>

        {apiError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
                <p className="mt-1 text-sm text-red-700">{apiError}</p>
                <button
                  onClick={() => {
                    setApiError(null);
                    window.location.reload();
                  }}
                  className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search results or category grid */}
        {searchQuery ? (
          <div className="mb-8">
            <h2 className={`mb-4 text-2xl font-bold ${PODCAST.title}`}>Search results</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`h-8 w-8 animate-spin ${PODCAST.spinner}`} />
                <span className={`ml-3 ${PODCAST.body}`}>Searching...</span>
              </div>
            ) : visiblePodcastSearchResults.length === 0 ? (
              <p className={`py-12 text-center ${PODCAST.body}`}>
                No podcasts found for &ldquo;{searchTerm.trim()}&rdquo;
              </p>
            ) : (
              <>
                <p className={`mb-4 text-sm ${PODCAST.muted}`}>
                  {visiblePodcastSearchResults.length}{' '}
                  {visiblePodcastSearchResults.length === 1 ? 'podcast' : 'podcasts'} found
                </p>
                <ul className={`overflow-hidden rounded-xl divide-y divide-slate-100 ${PODCAST.card}`}>
                  {visiblePodcastSearchResults.map((podcast, index) =>
                    renderEpisodeRow(podcast, index)
                  )}
                </ul>
              </>
            )}
          </div>
        ) : (
        /* Category Covers Grid */
        <div className="mb-8">
          <h2 className={`mb-6 text-2xl font-bold ${PODCAST.title}`}>Podcast Categories</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`h-8 w-8 animate-spin ${PODCAST.spinner}`} />
              <span className={`ml-3 ${PODCAST.body}`}>Loading categories...</span>
            </div>
          ) : apiError ? (
            <div className="text-center py-12">
              <Headphones className={`mx-auto mb-4 h-12 w-12 ${PODCAST.muted}`} />
              <p className={PODCAST.body}>Unable to load podcasts due to API connection error</p>
              <p className={`mt-2 text-sm ${PODCAST.muted}`}>Please check the backend server status</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {visibleCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`group cursor-pointer overflow-hidden rounded-xl transition-all duration-200 hover:border-slate-300 hover:shadow-md ${PODCAST.card}`}
                    onClick={() => openCategory(category.id)}
                  >
                    {/* Category Cover Image */}
                    <div className="relative h-64 bg-slate-100">
                      <div className={`absolute inset-0 flex items-center justify-center ${PODCAST.placeholder}`}>
                        <Headphones className="h-16 w-16 text-slate-400" />
                      </div>
                      {category.cover && (
                        <img
                          src={category.cover}
                          alt={category.name}
                          className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                      <h3 className={`line-clamp-2 text-lg font-semibold ${PODCAST.title}`}>
                        {category.name}
                      </h3>
                      {category.podcasts.length === 0 && (
                        <p className={`mt-1 text-sm ${PODCAST.muted}`}>Coming soon</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        )}


        {/* Podcast Player Modal */}
        {selectedPodcast && (
          <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-slate-900/50">
            <div className={`relative top-20 mx-auto w-full max-w-2xl rounded-xl border border-slate-200 p-5 shadow-xl ${PODCAST.card}`}>
              <div className="mt-3">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className={`text-xl font-medium ${PODCAST.title}`}>{selectedPodcast.title}</h3>
                  <button
                    onClick={() => setSelectedPodcast(null)}
                    className={`${PODCAST.muted} hover:text-slate-700`}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cover */}
                  <div>
                    <img
                      src={selectedPodcast.cover}
                      alt={selectedPodcast.title}
                      className="w-full rounded-lg bg-slate-100"
                      onError={(e) => {
                        // Fallback to category default image
                        e.target.src = getCategoryCoverImage(selectedPodcast.category);
                      }}
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <p className={`mb-2 text-sm ${PODCAST.body}`}>{selectedPodcast.description}</p>
                      <div className={`flex items-center text-sm ${PODCAST.muted}`}>
                        <User className="w-4 h-4 mr-2" />
                        {selectedPodcast.host}
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-4 text-sm ${PODCAST.muted}`}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(selectedPodcast.duration)}
                      </div>
                      <div className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        {selectedPodcast.plays} plays
                      </div>
                    </div>
                    
                    <div>
                      <h4 className={`mb-2 text-sm font-medium ${PODCAST.title}`}>Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPodcast.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 flex gap-2">
                      <button
                        onClick={() => handlePlay(selectedPodcast)}
                        className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${PODCAST.cta}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </button>
                      <button
                        onClick={() => handleDownload(selectedPodcast)}
                        className="flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                        title="Download podcast"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Podcasts;
