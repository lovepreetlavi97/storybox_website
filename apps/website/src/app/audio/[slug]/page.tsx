'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, Pause, Clock, Globe, BookOpen, 
  ChevronRight, Calendar, Volume2, ArrowLeft 
} from 'lucide-react';
import { useAudioPlayer, API_BASE_URL } from '../../../context/AudioContext';
import { IAudio, getMediaUrl, formatDuration } from 'shared';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AudioDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const { currentAudio, isPlaying, playAudio } = useAudioPlayer();

  const [audio, setAudio] = useState<IAudio | null>(null);
  const [related, setRelated] = useState<IAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        setError('');

        // Fetch details by slug
        const res = await fetch(`${API_BASE_URL}/api/public/audios/${slug}`);
        const data = await res.json();

        if (data.success && data.data) {
          setAudio(data.data);
          
          // Fetch related
          const relRes = await fetch(`${API_BASE_URL}/api/public/audios/${data.data._id}/related`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelated(relData.data);
          }
        } else {
          setError(data.error || 'Audiobook not found');
        }
      } catch (err: any) {
        console.error('Error loading audiobook details:', err);
        setError('Error connecting to streaming server');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchDetails();
    }
  }, [slug]);

  const handlePlayToggle = () => {
    if (!audio) return;
    playAudio(audio, [audio, ...related]);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')} minutes`;
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-sm font-semibold text-zinc-400">Loading details...</span>
        </div>
      </div>
    );
  }

  if (error || !audio) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{error || 'Audiobook not found'}</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 px-6 py-2.5 rounded-full font-bold text-white transition-all cursor-pointer text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
    );
  }

  const isCurrentPlaying = currentAudio?._id === audio._id && isPlaying;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back button representation */}
      <Link 
        href="/"
        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-semibold text-sm transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4.5 w-4.5 transform group-hover:-translate-x-0.5 transition-transform" />
        Back to Browse
      </Link>

      {/* Main details hero card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 bg-zinc-900/30 p-6 md:p-8 rounded-3xl border border-zinc-900/60">
        
        {/* Cover Art Left */}
        <div className="md:col-span-1 flex flex-col items-center sm:items-start">
          <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getMediaUrl(audio.thumbnailUrl, API_BASE_URL)} 
              alt={audio.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info Right */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-rose-400 border border-zinc-800">
                <BookOpen className="h-3.5 w-3.5" />
                {(audio.category as any)?.name || 'Audiobook'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                {audio.language}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                {formatDuration(audio.duration)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {audio.title}
            </h1>

            {/* Description content */}
            <div className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl whitespace-pre-wrap pt-2">
              {audio.description}
            </div>

          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-zinc-900">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-8 py-4 rounded-full transition-all cursor-pointer shadow-lg shadow-rose-500/25 hover:scale-[1.01]"
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="h-5 w-5 fill-current ml-0" />
                  Pause Audiobook
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                  Play Audiobook
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* RELATED AUDIO ROW */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Related in {(audio.category as any)?.name || 'Category'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {related.map((item) => {
              const isCurrent = currentAudio?._id === item._id;
              const isPlayingThis = isCurrent && isPlaying;

              return (
                <div 
                  key={item._id}
                  className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 rounded-2xl p-3 transition-all duration-200 group relative"
                >
                  <Link href={`/audio/${item.slug}`} className="block">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-950 shadow mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={getMediaUrl(item.thumbnailUrl, API_BASE_URL)} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playAudio(item, [item, ...related]);
                        }}
                        className={`absolute bottom-2.5 right-2.5 h-8.5 w-8.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg transition-all duration-200 transform cursor-pointer ${
                          isCurrent 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-90 translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                        } hover:bg-rose-600`}
                      >
                        {isPlayingThis ? (
                          <Pause className="h-4 w-4 fill-current ml-0" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-rose-500 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      {item.language} &bull; {formatDuration(item.duration)}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
