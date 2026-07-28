'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause, Clock, Heart } from 'lucide-react';
import { IAudio } from '@/types';
import { getMediaUrl, formatDuration } from '@/utils';
import { API_BASE_URL } from '@/constants/config';
import { useAudioPlayer } from '@/hooks';

interface AudioCardProps {
  audio: IAudio;
  queueList?: IAudio[];
  progress?: number;
}

export function AudioCard({ audio, queueList = [], progress }: AudioCardProps) {
  const { currentAudio, isPlaying, playAudio, toggleWishlist, isInWishlist } = useAudioPlayer();

  const isCurrent = currentAudio?._id === audio._id;
  const isPlayingThis = isCurrent && isPlaying;
  const isFav = isInWishlist(audio._id);

  const handleCardPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playAudio(audio, queueList.length > 0 ? queueList : [audio]);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(audio);
  };

  const formattedDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  return (
    <div className="w-40 sm:w-44 shrink-0 snap-start bg-transparent p-1.5 transition-all duration-500 hover:-translate-y-1.5 group relative">
      <Link href={`/audio/${audio.slug}`} className="block">
        {/* Thumbnail Container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.03] transition-all duration-550 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:border-white/[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={getMediaUrl(audio.thumbnailUrl, API_BASE_URL)} 
            alt={audio.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
            loading="lazy"
          />

          {/* Gradient Overlay for luxury touch */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-zinc-950/60 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-zinc-900 active:scale-95 transition-all duration-300 z-10 cursor-pointer text-zinc-300 hover:text-white"
          >
            <Heart 
              className={`h-4.5 w-4.5 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-zinc-300 hover:text-rose-400'
              }`} 
            />
          </button>

          {/* Always Visible Play/Pause Button on Every Card */}
          <button
            onClick={handleCardPlay}
            aria-label={isPlayingThis ? "Pause" : "Play"}
            className={`absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 h-9 w-9 sm:h-10 sm:w-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-all duration-300 transform cursor-pointer z-10 ${
              isPlayingThis 
                ? 'bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-rose-400/50 opacity-100 scale-100' 
                : 'bg-zinc-900/90 text-white hover:bg-rose-500 border border-white/10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 group-hover:scale-100'
            }`}
          >
            {isPlayingThis ? (
              <Pause className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current" />
            ) : (
              <Play className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Optional progress bar */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/60 backdrop-blur-xs overflow-hidden">
              <div 
                className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>

        {/* Title & Info */}
        <h3 className="font-extrabold text-sm text-zinc-100 tracking-tight group-hover:text-rose-400 transition-colors duration-300 line-clamp-1 mt-1">
          {audio.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[9.5px] tracking-wide text-zinc-500 uppercase font-bold">
          <span className="truncate max-w-[85px]">{(audio.category as any)?.name || 'Audiobook'}</span>
          <span className="flex items-center gap-0.5 shrink-0 font-mono text-[10px] text-zinc-400 font-medium lowercase">
            <Clock className="h-3 w-3 text-rose-500/70" />
            {formattedDuration(audio.duration)}
          </span>
        </div>
      </Link>
    </div>
  );
}
