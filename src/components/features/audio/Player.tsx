'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Gauge, Music
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { getMediaUrl, formatDuration } from '@/utils';
import { API_BASE_URL } from '@/constants/config';

export function Player() {
  const {
    currentAudio,
    isPlaying,
    playbackSpeed,
    volume,
    currentTime,
    duration,
    autoNext,
    togglePlay,
    setPlaybackSpeed,
    setVolume,
    seek,
    setAutoNext,
    next,
    previous,
    queue,
    currentIndex
  } = useAudioPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [imgError, setImgError] = useState(false);

  if (!currentAudio) return null;

  const speeds = [0.5, 1, 1.25, 1.5, 2];

  const handleVolumeToggle = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const thumbnailUrl = getMediaUrl(currentAudio.thumbnailUrl, API_BASE_URL);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-900/98 backdrop-blur border-t border-zinc-800 px-4 md:px-8 flex items-center justify-between z-40 select-none shadow-2xl">
      
      {/* LEFT: Thumbnail and Title Details */}
      <div className="flex items-center gap-3 shrink-0 max-w-[160px] sm:max-w-xs min-w-0">
        <Link href={`/audio/${currentAudio.slug}`} className="shrink-0">
          {!imgError && thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={thumbnailUrl} 
              alt={currentAudio.title} 
              onError={() => setImgError(true)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover bg-zinc-850 shrink-0 border border-zinc-800 shadow-md"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-rose-500 shrink-0">
              <Music className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <Link 
            href={`/audio/${currentAudio.slug}`}
            className="font-semibold text-xs sm:text-sm text-white hover:text-rose-500 hover:underline block truncate cursor-pointer"
          >
            {currentAudio.title}
          </Link>
          <span className="text-[10px] sm:text-xs text-zinc-400 block truncate">
            {(currentAudio.category as any)?.name || 'Audiobook'}
          </span>
        </div>
      </div>

      {/* CENTER: Playback Controls and Prominent Seek Bar */}
      <div className="flex flex-col items-center flex-1 max-w-xl sm:max-w-2xl px-2 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6 mb-1.5 sm:mb-2">
          <button 
            onClick={previous}
            disabled={queue.length <= 1 || currentIndex === 0}
            aria-label="Previous Track"
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:hover:text-zinc-400 p-1"
          >
            <SkipBack className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-white/10"
          >
            {isPlaying ? (
              <Pause className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current ml-0" />
            ) : (
              <Play className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current ml-0.5" />
            )}
          </button>

          <button 
            onClick={next}
            disabled={queue.length <= 1 || currentIndex === queue.length - 1}
            aria-label="Next Track"
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:hover:text-zinc-400 p-1"
          >
            <SkipForward className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" />
          </button>
        </div>

        {/* Wide & Easy-to-Touch Seek Bar */}
        <div className="w-full flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] font-mono text-zinc-400 w-8 text-right shrink-0">
            {formatDuration(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center py-2 group cursor-pointer">
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-2.5 sm:h-3 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-rose-500 hover:h-3.5 transition-all outline-none shadow-inner"
              style={{
                background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${progressPercent}%, #27272a ${progressPercent}%, #27272a 100%)`
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 w-8 shrink-0">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* RIGHT: Volume, Speed and Autoplay Options */}
      <div className="flex items-center justify-end gap-6 w-1/3">
        {/* Auto Next Switch */}
        <label className="hidden lg:flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-700 text-rose-500 bg-zinc-800 focus:ring-rose-500/20"
          />
          <span className="text-zinc-400 font-medium">Auto Play Next</span>
        </label>

        {/* Speed control */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Gauge className="h-3.5 w-3.5 text-rose-500" />
            <span>{playbackSpeed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex flex-col gap-1 w-24 shadow-2xl z-50">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    playbackSpeed === s
                      ? 'bg-rose-500 text-white'
                      : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume controls */}
        <div className="hidden sm:flex items-center gap-2.5 w-28">
          <button 
            onClick={handleVolumeToggle}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {volume === 0 ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 outline-none"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume * 100}%, #27272a ${volume * 100}%, #27272a 100%)`
            }}
          />
        </div>
      </div>
      
    </div>
  );
}

export default Player;
