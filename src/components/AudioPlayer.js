import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  SkipBack,
  SkipForward,
  X,
  ChevronDown,
} from 'lucide-react';
import { downloadPodcastAudio } from '../utils/podcastDownload';
import { getResolvedApiBaseUrl } from '../services/apiService';

const MIME_BY_EXT = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
};

const SKIP_SECONDS = 15;

const getExtension = (url = '') => {
  const path = url.split('?')[0].split('#')[0];
  return path.includes('.') ? path.split('.').pop().toLowerCase() : '';
};

const getAudioMimeType = (url) => MIME_BY_EXT[getExtension(url)] || 'audio/mpeg';

const resolveApiUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${getResolvedApiBaseUrl()}${url.startsWith('/') ? url : `/${url}`}`;
};

const isEmbeddedPreview = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname.toLowerCase();
  return host.includes('vscode') || host.includes('webview');
};

const formatTime = (seconds) => {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const readDurationFromAudio = (audio) => {
  if (!audio) return null;
  const d = audio.duration;
  if (Number.isFinite(d) && d > 0) return d;
  if (audio.seekable?.length > 0) {
    const end = audio.seekable.end(audio.seekable.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }
  return null;
};

const parseDurationLabel = (label) => {
  if (label == null || label === '' || label === 'N/A' || label === 'Live' || label === 'Series') {
    return null;
  }
  if (typeof label === 'number' && Number.isFinite(label) && label > 0) return label;
  const parts = String(label).trim().split(':').map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
};

const AudioPlayer = ({ audioUrl, podcastId, podcastTitle, podcastCover, podcastDuration, onClose }) => {
  const audioRef = useRef(null);
  const userPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const stallRecoveryRef = useRef(null);
  const wasPlayingBeforeHideRef = useRef(false);
  const uiTransitionRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(null);

  const buildPlaybackUrls = useCallback(() => {
    if (!audioUrl || audioUrl === '#' || audioUrl === 'null' || audioUrl === 'undefined') {
      return { stream: null, direct: null };
    }

    const direct = (() => {
      const isDrive = audioUrl.includes('drive.google.com');
      if (isDrive) {
        if (audioUrl.includes('drive.google.com/uc?export=open')) return audioUrl;
        const match =
          audioUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
          audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) return `https://drive.google.com/uc?export=open&id=${match[1]}`;
      }
      return resolveApiUrl(audioUrl);
    })();

    const stream = podcastId
      ? `${getResolvedApiBaseUrl()}/api/podcasts/${podcastId}/stream`
      : null;

    return { stream, direct };
  }, [audioUrl, podcastId]);

  const playableUrl = sourceUrl;
  const audioMimeType = getAudioMimeType(audioUrl || playableUrl || '');

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const recoverFromStall = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userPausedRef.current || !isPlayingRef.current || audio.ended) return;

    clearTimeout(stallRecoveryRef.current);
    stallRecoveryRef.current = setTimeout(() => {
      const a = audioRef.current;
      if (!a || userPausedRef.current || !isPlayingRef.current || a.ended) return;

      if (a.paused || a.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        const t = a.currentTime;
        a.currentTime = Math.min(t + 0.05, (a.duration || t + 1) - 0.1);
        a.play().catch(() => {});
      }
    }, 1200);
  }, []);

  const skip = useCallback((delta) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = duration || audio.duration || 0;
    audio.currentTime = Math.max(0, Math.min(max, audio.currentTime + delta));
    if (isPlayingRef.current && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [duration]);

  useEffect(() => {
    const { stream, direct } = buildPlaybackUrls();
    const embedded = isEmbeddedPreview();
    // VS Code / iframe previews handle direct CDN URLs more reliably than stream redirects
    const initial = embedded && direct ? direct : stream || direct;
    setSourceUrl(initial);
  }, [buildPlaybackUrls]);

  useEffect(() => {
    if (!sourceUrl) return;
    userPausedRef.current = isEmbeddedPreview();
    setCurrentTime(0);
    setDuration(0);
    setIsExpanded(false);
    setIsPlaying(!isEmbeddedPreview());
  }, [sourceUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
    }
  }, [sourceUrl]);

  const resumeIfNeeded = useCallback(() => {
    requestAnimationFrame(() => {
      const audio = audioRef.current;
      if (audio && isPlayingRef.current && !userPausedRef.current && audio.paused && !audio.ended) {
        audio.play().catch(() => {});
      }
      uiTransitionRef.current = false;
    });
  }, []);

  const expandPlayer = useCallback(() => {
    uiTransitionRef.current = true;
    setIsExpanded(true);
    resumeIfNeeded();
  }, [resumeIfNeeded]);

  const minimizePlayer = useCallback(() => {
    uiTransitionRef.current = true;
    setIsExpanded(false);
    resumeIfNeeded();
  }, [resumeIfNeeded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      const d = readDurationFromAudio(audio);
      if (d) setDuration((prev) => (Math.abs(prev - d) > 0.5 ? d : prev));
    };
    const updateDuration = () => {
      const d = readDurationFromAudio(audio);
      if (d) setDuration(d);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      userPausedRef.current = true;
    };
    const handleError = () => {
      const { stream, direct } = buildPlaybackUrls();
      if (sourceUrl && stream && direct && sourceUrl === stream) {
        setSourceUrl(direct);
        userPausedRef.current = false;
        setIsPlaying(true);
        return;
      }
      setIsPlaying(false);
      userPausedRef.current = true;
    };
    const handlePlaying = () => clearTimeout(stallRecoveryRef.current);
    const handlePause = () => {
      if (uiTransitionRef.current) return;
      if (!userPausedRef.current && isPlayingRef.current && !audio.ended) {
        recoverFromStall();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', recoverFromStall);
    audio.addEventListener('waiting', recoverFromStall);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      clearTimeout(stallRecoveryRef.current);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', recoverFromStall);
      audio.removeEventListener('waiting', recoverFromStall);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
    };
  }, [sourceUrl, recoverFromStall, buildPlaybackUrls]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      userPausedRef.current = false;
      audio.play().catch(() => setIsPlaying(false));
    } else {
      userPausedRef.current = true;
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (duration > 0) return undefined;
    const tick = () => {
      const d = readDurationFromAudio(audioRef.current);
      if (d) setDuration(d);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [duration, playableUrl, isPlaying]);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        wasPlayingBeforeHideRef.current = isPlayingRef.current && !audio.paused;
      } else if (wasPlayingBeforeHideRef.current && !userPausedRef.current) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        wasPlayingBeforeHideRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!podcastTitle || !('mediaSession' in navigator)) return undefined;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: podcastTitle,
      artist: 'Family of Greatness',
      album: 'Podcasts',
      artwork: podcastCover
        ? [{ src: podcastCover, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });

    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-SKIP_SECONDS));
    navigator.mediaSession.setActionHandler('seekforward', () => skip(SKIP_SECONDS));

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [podcastTitle, podcastCover, skip]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    const nextPlaying = !isPlaying;
    if (nextPlaying && audio) {
      userPausedRef.current = false;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      return;
    }
    setIsPlaying(nextPlaying);
  };

  const handleSeek = (e, barRef) => {
    e.stopPropagation();
    const audio = audioRef.current;
    const bar = barRef?.current || e.currentTarget;
    const total =
      readDurationFromAudio(audio) || duration || parseDurationLabel(podcastDuration);
    if (!audio || !bar || !total) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = percentage * total;
  };

  const handleDownload = (e) => {
    e?.stopPropagation();
    if (
      !downloadPodcastAudio({
        id: podcastId,
        title: podcastTitle,
        audioUrl,
      })
    ) {
      window.alert('No audio available for download');
    }
  };

  const fallbackDuration = parseDurationLabel(podcastDuration);
  const effectiveDuration = duration > 0 ? duration : (fallbackDuration || 0);
  const progressPct =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;
  const totalTimeLabel =
    effectiveDuration > 0
      ? formatTime(effectiveDuration)
      : podcastDuration && podcastDuration !== 'N/A'
        ? String(podcastDuration)
        : '0:00';
  const miniProgressRef = useRef(null);
  const fullProgressRef = useRef(null);

  const renderProgressBar = (barRef, { tall = false, showThumb = true } = {}) => (
    <div
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={effectiveDuration || 0}
      aria-valuenow={currentTime}
      className={`relative w-full cursor-pointer overflow-visible rounded-full bg-white/25 ${
        tall ? 'h-1.5' : 'h-1'
      }`}
      onClick={(e) => handleSeek(e, barRef)}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-white"
        style={{ width: `${progressPct}%` }}
      />
      {showThumb && (
        <div
          className={`absolute top-1/2 rounded-full bg-white shadow-md ${
            tall ? 'h-3 w-3' : 'h-2.5 w-2.5'
          }`}
          style={{
            left: `calc(${progressPct}% - ${tall ? 6 : 5}px)`,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </div>
  );

  if (!playableUrl) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-6xl p-4 text-center">
          <p className="text-sm">No audio available for this episode</p>
        </div>
      </div>
    );
  }

  const coverNode = podcastCover ? (
    <img
      src={podcastCover}
      alt=""
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-700 to-secondary-600 text-3xl font-bold text-white">
      FOG
    </div>
  );

  const playButton = (size = 'md') => {
    const sizes = {
      sm: 'h-10 w-10',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };
    const iconSizes = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return (
      <button
        type="button"
        onClick={togglePlay}
        className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-transform hover:scale-105`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className={`${iconSizes[size]} ml-0.5`} />
        ) : (
          <Play className={`${iconSizes[size]} ml-1`} />
        )}
      </button>
    );
  };

  const expandedPlayer =
    isExpanded &&
    createPortal(
      <div className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-[#1a1a1a] via-[#121212] to-black text-white">
        <div className="flex items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={minimizePlayer}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Minimize player"
          >
            <ChevronDown className="h-7 w-7" />
          </button>
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Now playing</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Close player"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 pb-8">
          <div className="mx-auto mb-8 aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
            {coverNode}
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold leading-snug sm:text-2xl">{podcastTitle}</h2>
            <p className="mt-1 text-sm text-white/50">Family of Greatness · Podcast</p>
          </div>

          <div className="mb-2">
            {renderProgressBar(fullProgressRef, { tall: true, showThumb: true })}
            <div className="mt-2 flex justify-between text-xs font-mono text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{totalTimeLabel}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <button
              type="button"
              onClick={() => skip(-SKIP_SECONDS)}
              className="rounded-full p-3 text-white/80 hover:bg-white/10"
              aria-label={`Skip back ${SKIP_SECONDS} seconds`}
            >
              <SkipBack className="h-7 w-7" />
            </button>
            {playButton('lg')}
            <button
              type="button"
              onClick={() => skip(SKIP_SECONDS)}
              className="rounded-full p-3 text-white/80 hover:bg-white/10"
              aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
            >
              <SkipForward className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15"
              aria-label="Download episode"
            >
              <Download className="h-5 w-5" />
              Download
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  const miniPlayer = (
    <div
      className={`fixed left-0 right-0 z-50 border-t border-white/10 bg-[#181818] text-white shadow-2xl ${
        isExpanded ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 sm:px-4"
        onClick={expandPlayer}
        onKeyDown={(e) => e.key === 'Enter' && expandPlayer()}
        role="button"
        tabIndex={0}
        aria-label="Expand player"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md shadow-md">{coverNode}</div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{podcastTitle}</p>
          <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
            {renderProgressBar(miniProgressRef, { tall: false, showThumb: false })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {playButton('sm')}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const desktopBar = !isMobile && (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {podcastCover && (
          <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-lg sm:block">
            {coverNode}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => skip(-SKIP_SECONDS)}
            className="rounded-full p-2 transition-colors hover:bg-white/10"
            aria-label={`Skip back ${SKIP_SECONDS} seconds`}
          >
            <SkipBack className="h-5 w-5" />
          </button>
          {playButton('md')}
          <button
            type="button"
            onClick={() => skip(SKIP_SECONDS)}
            className="rounded-full p-2 transition-colors hover:bg-white/10"
            aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="min-w-[45px] font-mono text-xs text-gray-300">{formatTime(currentTime)}</span>
            <div
              className="group h-1.5 flex-1 cursor-pointer rounded-full bg-gray-700"
              onClick={(e) => handleSeek(e)}
            >
              <div
                className="relative h-full rounded-full bg-white transition-all group-hover:bg-primary-400"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="min-w-[45px] text-right font-mono text-xs text-gray-300">
              {totalTimeLabel}
            </span>
          </div>
          <h4 className="truncate pr-2 text-sm font-semibold">{podcastTitle}</h4>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className="hidden rounded-full p-2 hover:bg-white/10 md:block"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Single audio element — never move between mini/expanded or playback stops */}
      <audio
        ref={audioRef}
        key={playableUrl}
        preload="auto"
        playsInline
        className="hidden"
        aria-hidden
        onLoadedMetadata={(e) => {
          const d = readDurationFromAudio(e.currentTarget);
          if (d) setDuration(d);
        }}
        onLoadedData={(e) => {
          const d = readDurationFromAudio(e.currentTarget);
          if (d) setDuration(d);
        }}
        onDurationChange={(e) => {
          const d = readDurationFromAudio(e.currentTarget);
          if (d) setDuration(d);
        }}
      >
        <source src={playableUrl} type={audioMimeType} />
      </audio>

      {isMobile ? (
        <>
          {miniPlayer}
          {expandedPlayer}
        </>
      ) : (
        desktopBar
      )}
    </>
  );
};

export default AudioPlayer;
