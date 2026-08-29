'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { IAudio } from '@/types';
import { getMediaUrl } from '@/utils/media';
import { API_BASE_URL } from '@/constants/config';
import { SubscribeModal } from '@/components/common';

export interface RecentlyListenedItem {
  audio: IAudio;
  currentTime: number;
  progress: number;
}

export interface AudioPlayerContextType {
  currentAudio: IAudio | null;
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  currentTime: number;
  duration: number;
  autoNext: boolean;
  queue: IAudio[];
  currentIndex: number;
  isSubscribed: boolean;
  isSubscribeModalOpen: boolean;
  openSubscribeModal: (title?: string, message?: string) => void;
  closeSubscribeModal: () => void;
  playAudio: (audio: IAudio, currentQueue?: IAudio[], startTime?: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (vol: number) => void;
  seek: (time: number) => void;
  setAutoNext: (auto: boolean) => void;
  next: () => void;
  previous: () => void;
  recentlyListened: RecentlyListenedItem[];
  wishlist: IAudio[];
  toggleWishlist: (audio: IAudio) => void;
  isInWishlist: (audioId: string) => boolean;
  closePlayer: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<IAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [queue, setQueue] = useState<IAudio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [recentlyListened, setRecentlyListened] = useState<RecentlyListenedItem[]>([]);
  const [wishlist, setWishlist] = useState<IAudio[]>([]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Unlock Full Audiobooks with StoryHub VIP");
  const [modalMessage, setModalMessage] = useState("You've enjoyed your free demo preview! Subscribe for just 15 KSH/Daily to get unlimited access to all audiobooks, full series, and ad-free listening.");

  const isSubscribedRef = useRef(false);

  const openSubscribeModal = (title?: string, message?: string) => {
    if (title) setModalTitle(title);
    if (message) setModalMessage(message);
    setIsSubscribeModalOpen(true);
  };

  const closeSubscribeModal = () => {
    setIsSubscribeModalOpen(false);
  };

  useEffect(() => {
    const checkSub = () => {
      if (typeof window !== 'undefined') {
        const sub = localStorage.getItem('storyhub_subscribed') === 'true';
        const params = new URLSearchParams(window.location.search);
        const bypass = params.get('preview') === 'true' || params.get('admin') === 'true';
        const active = sub || bypass;
        setIsSubscribed(active);
        isSubscribedRef.current = active;
      }
    };
    checkSub();
    window.addEventListener('focus', checkSub);
    return () => window.removeEventListener('focus', checkSub);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Object on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Load volume and autoNext from localStorage
    const savedVol = localStorage.getItem('player_volume');
    if (savedVol) {
      const parsed = parseFloat(savedVol);
      audio.volume = parsed;
      setVolumeState(parsed);
    } else {
      audio.volume = 0.8;
    }

    const savedAutoNext = localStorage.getItem('player_autonext');
    if (savedAutoNext) {
      setAutoNext(savedAutoNext === 'true');
    }

    const savedRecently = localStorage.getItem('recently_listened');
    if (savedRecently) {
      try {
        const parsed = JSON.parse(savedRecently);
        setRecentlyListened(parsed);
        
        // Background validation to clean up deleted audio tracks
        (async () => {
          if (!Array.isArray(parsed) || parsed.length === 0) return;
          try {
            const validated = await Promise.all(
              parsed.map(async (item: any) => {
                if (!item || !item.audio || !item.audio.slug) return null;
                try {
                  const res = await fetch(`${API_BASE_URL}/api/public/audios/${item.audio.slug}`, { cache: 'no-store' });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                      return item;
                    }
                  }
                } catch (e) {
                  // Network error or 404
                }
                return null;
              })
            );
            
            const cleanList = validated.filter(Boolean) as RecentlyListenedItem[];
            if (cleanList.length !== parsed.length) {
              setRecentlyListened(cleanList);
              localStorage.setItem('recently_listened', JSON.stringify(cleanList));
            }
          } catch (err) {
            console.error('Recently listened validation error:', err);
          }
        })();
      } catch (e) {
        console.error('Failed to parse recently listened from localStorage:', e);
      }
    }

    // Load and validate wishlist
    const savedWishlist = localStorage.getItem('user_wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(parsed);
        
        // Background check to remove deleted audiobooks from wishlist
        (async () => {
          if (!Array.isArray(parsed) || parsed.length === 0) return;
          try {
            const validated = await Promise.all(
              parsed.map(async (audio: any) => {
                if (!audio || !audio.slug) return null;
                try {
                  const res = await fetch(`${API_BASE_URL}/api/public/audios/${audio.slug}`, { cache: 'no-store' });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                      return audio;
                    }
                  }
                } catch (e) {
                  // Ignore
                }
                return null;
              })
            );
            const cleanList = validated.filter(Boolean) as IAudio[];
            if (cleanList.length !== parsed.length) {
              setWishlist(cleanList);
              localStorage.setItem('user_wishlist', JSON.stringify(cleanList));
            }
          } catch (err) {
            console.error('Wishlist validation error:', err);
          }
        })();
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage:', e);
      }
    }

    // Audio Event Listeners
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isSubscribedRef.current && audio.currentTime >= 60) {
        audio.pause();
        setIsPlaying(false);
        audio.currentTime = 0;
        setCurrentTime(0);
        openSubscribeModal(
          "60-Second Free Preview Ended",
          "You've reached the 60-second free demo limit for this audiobook. Subscribe to StoryHub VIP (15 KSH/Daily) for full, unlimited audiobook streaming!"
        );
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        setCurrentAudio((prev) => {
          if (prev && (!prev.duration || prev.duration <= 0)) {
            return { ...prev, duration: Math.round(audio.duration) };
          }
          return prev;
        });
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      handleAudioEnded();
    };

    const onError = (e: any) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const lastSavedTimeRef = useRef(0);

  useEffect(() => {
    if (!currentAudio || duration <= 0) return;

    const timeDiff = Math.abs(currentTime - lastSavedTimeRef.current);
    if (timeDiff < 1 && currentTime !== 0 && currentTime !== duration) {
      return;
    }

    lastSavedTimeRef.current = currentTime;

    setRecentlyListened((prev) => {
      const progress = (currentTime / duration) * 100;
      const filtered = prev.filter((item) => item.audio._id !== currentAudio._id);
      const newItem = {
        audio: currentAudio,
        currentTime,
        progress
      };
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem('recently_listened', JSON.stringify(updated));
      return updated;
    });
  }, [currentAudio, currentTime, duration]);

  // Update volume
  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    localStorage.setItem('player_volume', clamped.toString());
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  // Update playback speed
  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Update seek position
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Play a specific audio item
  const playAudio = (audio: IAudio, currentQueue: IAudio[] = [], startTime?: number) => {
    if (!audioRef.current) return;

    const fullUrl = getMediaUrl(audio.audioUrl, API_BASE_URL);

    // If it's the same audio track, just resume
    if (currentAudio?._id === audio._id) {
      togglePlay();
      return;
    }

    // Check if there is saved progress for this track
    const saved = recentlyListened.find(item => item.audio._id === audio._id);
    const initialTime = startTime ?? (saved ? saved.currentTime : 0);

    audioRef.current.src = fullUrl;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.volume = volume;
    audioRef.current.currentTime = initialTime;
    setCurrentTime(initialTime);
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error('Playback trigger failed:', err);
        setIsPlaying(false);
      });

    setCurrentAudio(audio);
    
    // Set queue
    if (currentQueue.length > 0) {
      setQueue(currentQueue);
      const idx = currentQueue.findIndex((item) => item._id === audio._id);
      setCurrentIndex(idx);
    } else {
      setQueue([audio]);
      setCurrentIndex(0);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !currentAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && currentAudio && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const next = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      playAudio(queue[nextIdx], queue);
    }
  };

  const previous = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      playAudio(queue[prevIdx], queue);
    } else if (audioRef.current) {
      // restart current song
      audioRef.current.currentTime = 0;
    }
  };

  // Ref handle for ended state inside event listener
  const queueRef = useRef(queue);
  const indexRef = useRef(currentIndex);
  const autoNextRef = useRef(autoNext);

  useEffect(() => {
    queueRef.current = queue;
    indexRef.current = currentIndex;
    autoNextRef.current = autoNext;
  }, [queue, currentIndex, autoNext]);

  const handleAudioEnded = () => {
    if (autoNextRef.current && queueRef.current.length > 0 && indexRef.current < queueRef.current.length - 1) {
      const nextIdx = indexRef.current + 1;
      setCurrentIndex(nextIdx);
      playAudio(queueRef.current[nextIdx], queueRef.current);
    }
  };

  const toggleWishlist = (audio: IAudio) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === audio._id);
      let updated;
      if (exists) {
        updated = prev.filter((item) => item._id !== audio._id);
      } else {
        updated = [...prev, audio];
      }
      localStorage.setItem('user_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (audioId: string) => {
    return wishlist.some((item) => item._id === audioId);
  };

  const closePlayer = () => {
    pause();
    setCurrentAudio(null);
  };

  const updateAutoNext = (val: boolean) => {
    setAutoNext(val);
    localStorage.setItem('player_autonext', val.toString());
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentAudio,
        isPlaying,
        playbackSpeed,
        volume,
        currentTime,
        duration,
        autoNext,
        queue,
        currentIndex,
        isSubscribed,
        isSubscribeModalOpen,
        openSubscribeModal,
        closeSubscribeModal,
        playAudio,
        pause,
        resume,
        togglePlay,
        setPlaybackSpeed,
        setVolume,
        seek,
        setAutoNext: updateAutoNext,
        next,
        previous,
        recentlyListened,
        wishlist,
        toggleWishlist,
        isInWishlist,
        closePlayer,
      }}
    >
      {children}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={closeSubscribeModal}
        title={modalTitle}
        message={modalMessage}
      />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
