'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Gauge, Music, X, AlignLeft
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { getMediaUrl, formatDuration } from '@/utils';
import { API_BASE_URL } from '@/constants/config';

export function Player() {
  const pathname = usePathname();
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
    currentIndex,
    closePlayer
  } = useAudioPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [imgError, setImgError] = useState(false);

  if (pathname === '/subscribe' || pathname === '/redirect') return null;
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
      
      {/* Absolute Full-Width Thin Seek Bar on Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex items-center group cursor-pointer z-50">
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-rose-500 hover:h-1.5 transition-all outline-none"
          style={{
            background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${progressPercent}%, #27272a ${progressPercent}%, #27272a 100%)`
          }}
        />
      </div>

      {/* LEFT: Thumbnail and Title Details */}
      <div className="flex items-center gap-3 shrink-0 max-w-[150px] sm:max-w-xs min-w-0">
        <Link href={`/audio/${currentAudio.slug}`} className="shrink-0">
          {!imgError && thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={thumbnailUrl} 
              alt={currentAudio.title} 
              onError={() => setImgError(true)}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover bg-zinc-850 shrink-0 border border-zinc-800 shadow-md"
            />
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-rose-500 shrink-0">
              <Music className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <Link 
            href={`/audio/${currentAudio.slug}`}
            className="font-semibold text-[11px] sm:text-sm text-white hover:text-rose-500 hover:underline block truncate cursor-pointer"
          >
            {currentAudio.title}
          </Link>
          <span className="text-[9px] sm:text-xs text-zinc-400 block truncate">
            {(currentAudio.category as any)?.name || 'Audiobook'}
          </span>
        </div>
      </div>

      {/* CENTER: Playback Controls & Centered Timer */}
      <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={previous}
            disabled={queue.length <= 1 || currentIndex === 0}
            aria-label="Previous Track"
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:hover:text-zinc-400 p-1"
          >
            <SkipBack className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-white/10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current ml-0" />
            ) : (
              <Play className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current ml-0.5" />
            )}
          </button>

          <button 
            onClick={next}
            disabled={queue.length <= 1 || currentIndex === queue.length - 1}
            aria-label="Next Track"
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:hover:text-zinc-400 p-1"
          >
            <SkipForward className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current" />
          </button>
        </div>

        {/* Centered Timer indicator */}
        <div className="flex items-center gap-1.5 mt-1 text-[9.5px] sm:text-[10px] font-mono text-zinc-400">
          <span>{formatDuration(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Volume, Speed & Close Control */}
      <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0">
        {/* Auto Next Switch (Hidden on mobile) */}
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
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-800 text-[10px] sm:text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Gauge className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-500" />
            <span>{playbackSpeed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex flex-col gap-1 w-20 sm:w-24 shadow-2xl z-50">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPlaybackSpeed(s);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer transition-all ${
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

        {/* Lyrics button (only show if currentAudio has lyrics!) */}
        {currentAudio.lyrics && (
          <button
            onClick={() => setShowLyricsModal(true)}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-[10px] sm:text-xs font-semibold ${
              showLyricsModal
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Show Lyrics"
          >
            <AlignLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Lyrics</span>
          </button>
        )}

        {/* Volume controls (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2 w-24 md:w-28">
          <button 
            onClick={handleVolumeToggle}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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

        {/* Close/Stop Button (Cross icon) */}
        <button
          onClick={closePlayer}
          aria-label="Stop & Close Player"
          className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-805 active:scale-95 transition-all shrink-0 cursor-pointer ml-1"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* LUXURY LYRICS MODAL OVERLAY */}
      {showLyricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col max-h-[75vh] overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setShowLyricsModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800 hover:bg-zinc-750 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header info */}
            <div className="mb-6 flex gap-4 items-center border-b border-zinc-800/80 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={getMediaUrl(currentAudio.thumbnailUrl, API_BASE_URL)} 
                alt={currentAudio.title} 
                className="h-14 w-14 rounded-xl object-cover border border-zinc-800 shadow-md"
              />
              <div className="text-left">
                <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">{currentAudio.title}</h3>
                <p className="text-xs text-zinc-400">{(currentAudio.category as any)?.name || 'Audiobook'}</p>
              </div>
            </div>

            {/* Scrollable lyrics area */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-1 space-y-6 select-text scroll-smooth">
              <div className="text-center font-medium text-base sm:text-lg leading-loose text-zinc-200 whitespace-pre-wrap tracking-wide font-sans md:px-6">
                {currentAudio.lyrics}
              </div>
            </div>

            {/* Footer brand touch */}
            <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Lyrics & Transcript Experience
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Player;
