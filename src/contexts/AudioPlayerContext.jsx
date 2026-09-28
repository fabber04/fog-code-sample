import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const [playingPodcast, setPlayingPodcast] = useState(null);

  const playPodcast = useCallback((podcast) => {
    if (!podcast) return;
    setPlayingPodcast(podcast);
    if (podcast.id) {
      localStorage.setItem('fog_last_played_podcast_id', podcast.id.toString());
    }
  }, []);

  const closePlayer = useCallback(() => {
    setPlayingPodcast(null);
  }, []);

  const value = useMemo(
    () => ({
      playingPodcast,
      isActive: Boolean(playingPodcast),
      playPodcast,
      closePlayer,
    }),
    [playingPodcast, playPodcast, closePlayer]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {playingPodcast && (
        <AudioPlayer
          audioUrl={playingPodcast.audioUrl}
          podcastId={playingPodcast.id}
          podcastTitle={playingPodcast.title}
          podcastCover={playingPodcast.cover}
          podcastDuration={playingPodcast.duration}
          onClose={closePlayer}
        />
      )}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return ctx;
}
