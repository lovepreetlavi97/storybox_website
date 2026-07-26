'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, ChevronRight, BookOpen, Clock, Music } from 'lucide-react';
import { useAudioPlayer, API_BASE_URL } from '../context/AudioContext';
import { IAudio, IBanner, ICategory } from 'shared';

export default function Homepage() {
  const { currentAudio, isPlaying, playAudio, recentlyListened } = useAudioPlayer();

  const [banners, setBanners] = useState<IBanner[]>([]);
  const [featured, setFeatured] = useState<IAudio[]>([]);
  const [trending, setTrending] = useState<IAudio[]>([]);
  const [latest, setLatest] = useState<IAudio[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHomeFeeds() {
      try {
        const [bannersRes, featuredRes, trendingRes, latestRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/public/banners`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/public/audios/featured`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/public/audios/trending`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/public/audios/latest`).then((r) => r.json()),
          fetch(`${API_BASE_URL}/api/public/categories`).then((r) => r.json()),
        ]);

        if (bannersRes.success) setBanners(bannersRes.data);
        if (featuredRes.success) setFeatured(featuredRes.data);
        if (trendingRes.success) setTrending(trendingRes.data);
        if (latestRes.success) setLatest(latestRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
      } catch (err: any) {
        console.error('Failed to load public feeds:', err);
        setError('Unable to reach streaming servers. Ensure the backend is active.');
      } finally {
        setLoading(false);
      }
    }

    fetchHomeFeeds();
  }, []);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  const handleCardPlay = (e: React.MouseEvent, audio: IAudio, feed: IAudio[]) => {
    e.preventDefault();
    e.stopPropagation();
    playAudio(audio, feed);
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <span className="text-sm font-semibold text-zinc-400">Loading audiobooks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Platform Offline</h2>
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-rose-500 hover:bg-rose-600 px-6 py-2.5 rounded-full font-bold text-white transition-all cursor-pointer text-sm"
        >
          Re-Check Connection
        </button>
      </div>
    );
  }

  // Audio Row Component to avoid duplication
  const AudioRow = ({ title, data }: { title: string; data: IAudio[] }) => {
    if (data.length === 0) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h2>
          <Link href="/search" className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors">
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Scrolling Cards Row */}
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x scroll-smooth">
          {data.map((audio) => {
            const isCurrent = currentAudio?._id === audio._id;
            const isPlayingThis = isCurrent && isPlaying;

            return (
              <div 
                key={audio._id}
                className="w-40 sm:w-44 shrink-0 snap-start bg-transparent p-1.5 transition-all duration-500 hover:-translate-y-1.5 group relative"
              >
                <Link href={`/audio/${audio.slug}`} className="block">
                  {/* Thumbnail Container */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.03] transition-all duration-550 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:border-white/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={audio.thumbnailUrl.startsWith('http') ? audio.thumbnailUrl : `${API_BASE_URL}${audio.thumbnailUrl}`} 
                      alt={audio.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for luxury touch */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Spotify Hover Play Button */}
                    <button
                      onClick={(e) => handleCardPlay(e, audio, data)}
                      className={`absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white/90 hover:bg-rose-500 text-zinc-900 hover:text-white backdrop-blur-sm flex items-center justify-center shadow-xl shadow-black/25 hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300 transform cursor-pointer ${
                        isCurrent 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlayingThis ? (
                        <Pause className="h-4.5 w-4.5 fill-current ml-0" />
                      ) : (
                        <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                      )}
                    </button>


                  </div>

                  {/* Title & Info */}
                  <h3 className="font-extrabold text-sm text-zinc-100 tracking-tight group-hover:text-rose-400 transition-colors duration-300 line-clamp-1 mt-1">
                    {audio.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[9.5px] tracking-wide text-zinc-500 uppercase font-bold">
                    <span className="truncate max-w-[85px]">{(audio.category as any)?.name || 'Audiobook'}</span>
                    <span className="flex items-center gap-0.5 shrink-0 font-mono text-[10px] text-zinc-400 font-medium lowercase">
                      <Clock className="h-3 w-3 text-rose-500/70" />
                      {formatDuration(audio.duration)}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. HERO BANNER SLIDER CONTAINER */}
      {banners.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900">
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar aspect-[21/9] sm:aspect-[24/9]">
            {banners.map((banner) => (
              <div 
                key={banner._id}
                className="w-full shrink-0 snap-start relative h-full flex flex-col justify-end p-6 sm:p-12"
              >
                {/* Background Banner image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `${API_BASE_URL}${banner.imageUrl}`} 
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                
                {/* Banner Content overlay */}
                <div className="relative max-w-md space-y-3 z-10">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {banner.title}
                  </h1>
                  {banner.description && (
                    <p className="text-zinc-300 text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed">
                      {banner.description}
                    </p>
                  )}
                  
                  {/* Banner CTA link */}
                  <div className="pt-2">
                    <Link 
                      href={
                        banner.linkType === 'audio' 
                          ? `/audio/${banner.linkValue}` 
                          : banner.linkType === 'category' 
                          ? `/search?category=${encodeURIComponent(banner.linkValue)}` 
                          : banner.linkValue
                      }
                      className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-500/20"
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      Listen Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. CATEGORIES SELECTOR TABS */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Browse Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/search?category=${encodeURIComponent(cat.slug)}`}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700/80 transition-all font-semibold text-sm text-zinc-200 shrink-0 cursor-pointer"
              >
                <BookOpen className="h-4.5 w-4.5 text-rose-500" />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Recently Listened Shelf */}
      {recentlyListened && recentlyListened.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Recently Listened</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x scroll-smooth">
            {recentlyListened.map((item) => {
              const isCurrent = currentAudio?._id === item.audio._id;
              const isPlayingThis = isCurrent && isPlaying;

              return (
                <div 
                  key={item.audio._id}
                  className="w-40 sm:w-44 shrink-0 snap-start bg-transparent p-1.5 transition-all duration-500 hover:-translate-y-1.5 group relative"
                >
                  <Link href={`/audio/${item.audio.slug}`} className="block">
                    {/* Thumbnail Container */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.03] transition-all duration-550 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:border-white/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.audio.thumbnailUrl.startsWith('http') ? item.audio.thumbnailUrl : `${API_BASE_URL}${item.audio.thumbnailUrl}`} 
                        alt={item.audio.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                        loading="lazy"
                      />

                      {/* Gradient Overlay for luxury touch */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Spotify Hover Play Button */}
                      <button
                        onClick={(e) => handleCardPlay(e, item.audio, recentlyListened.map(r => r.audio))}
                        className={`absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white/90 hover:bg-rose-500 text-zinc-900 hover:text-white backdrop-blur-sm flex items-center justify-center shadow-xl shadow-black/25 hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300 transform cursor-pointer ${
                          isCurrent 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="h-4.5 w-4.5 fill-current ml-0" />
                        ) : (
                          <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Red progress line showing how much is listened */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/60 backdrop-blur-xs overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Title & Info */}
                    <h3 className="font-extrabold text-sm text-zinc-100 tracking-tight group-hover:text-rose-400 transition-colors duration-300 line-clamp-1 mt-1">
                      {item.audio.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[9.5px] tracking-wide text-zinc-500 uppercase font-bold">
                      <span className="truncate max-w-[85px]">{(item.audio.category as any)?.name || 'Audiobook'}</span>
                      <span className="flex items-center gap-0.5 shrink-0 font-mono text-[10px] text-zinc-400 font-medium lowercase">
                        <Clock className="h-3 w-3 text-rose-500/70" />
                        {formatDuration(item.audio.duration)}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. FEEDS GRID ROWS */}
      <section className="space-y-10">
        <AudioRow title="Featured Audiobooks" data={featured} />
        <AudioRow title="Trending Now" data={trending} />
        <AudioRow title="Latest Releases" data={latest} />
      </section>

    </div>
  );
}
