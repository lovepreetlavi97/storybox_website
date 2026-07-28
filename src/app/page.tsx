'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, BookOpen, Laugh, Ghost, Heart, Compass, Sparkles, Rocket, Smile, Flame } from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { publicService } from '@/services';
import { IAudio, IBanner, ICategory } from '@/types';
import { getMediaUrl } from '@/utils';
import { API_BASE_URL } from '@/constants/config';
import { AudioRow, AudioCard } from '@/components/features';

const getCategoryStyle = (slug: string, name: string) => {
  const normalized = slug.toLowerCase();
  if (normalized.includes('funny') || normalized.includes('comedy') || normalized.includes('humor')) {
    return {
      icon: Laugh,
      color: '#FFC107',
      subtitle: '500+ laughs',
      iconFilled: true
    };
  }
  if (normalized.includes('horror') || normalized.includes('scary') || normalized.includes('ghost')) {
    return {
      icon: Ghost,
      color: '#EF4444',
      subtitle: '200+ nightmares',
      iconFilled: true
    };
  }
  if (normalized.includes('love') || normalized.includes('romance') || normalized.includes('romantic')) {
    return {
      icon: Heart,
      color: '#FF2D55',
      subtitle: '300+ romances',
      iconFilled: true
    };
  }
  if (normalized.includes('mystery') || normalized.includes('thriller') || normalized.includes('detective')) {
    return {
      icon: Compass,
      color: '#8B5CF6',
      subtitle: '180+ mysteries',
      iconFilled: true
    };
  }
  if (normalized.includes('fantasy') || normalized.includes('magic') || normalized.includes('wizard')) {
    return {
      icon: Sparkles,
      color: '#06B6D4',
      subtitle: '250+ adventures',
      iconFilled: true
    };
  }
  if (normalized.includes('sci-fi') || normalized.includes('scifi') || normalized.includes('science') || normalized.includes('space')) {
    return {
      icon: Rocket,
      color: '#3B82F6',
      subtitle: '120+ future tales',
      iconFilled: true
    };
  }
  if (normalized.includes('kids') || normalized.includes('child') || normalized.includes('children')) {
    return {
      icon: Smile,
      color: '#22C55E',
      subtitle: '400+ fun stories',
      iconFilled: true
    };
  }
  if (normalized.includes('motivational') || normalized.includes('motivation') || normalized.includes('inspirational') || normalized.includes('inspire')) {
    return {
      icon: Flame,
      color: '#F97316',
      subtitle: '150+ inspirations',
      iconFilled: true
    };
  }
  // Default fallback
  return {
    icon: BookOpen,
    color: '#F43F5E',
    subtitle: 'Explore stories',
    iconFilled: false
  };
};

export default function Homepage() {
  const { recentlyListened } = useAudioPlayer();

  const [banners, setBanners] = useState<IBanner[]>([]);
  const [featured, setFeatured] = useState<IAudio[]>([]);
  const [trending, setTrending] = useState<IAudio[]>([]);
  const [latest, setLatest] = useState<IAudio[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get('category') || '');
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || banners.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    async function fetchHomeFeeds() {
      try {
        const [bannersRes, featuredRes, trendingRes, latestRes, categoriesRes] = await Promise.all([
          publicService.fetchBanners(),
          publicService.fetchFeaturedAudios(),
          publicService.fetchTrendingAudios(),
          publicService.fetchLatestAudios(),
          publicService.fetchCategories(),
        ]);

        if (bannersRes.success && bannersRes.data) setBanners(bannersRes.data);
        if (featuredRes.success && featuredRes.data) setFeatured(featuredRes.data);
        if (trendingRes.success && trendingRes.data) setTrending(trendingRes.data);
        if (latestRes.success && latestRes.data) setLatest(latestRes.data);
        if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
      } catch (err: any) {
        console.error('Failed to load public feeds:', err);
        setError('Unable to reach streaming servers. Ensure the backend is active.');
      } finally {
        setLoading(false);
      }
    }

    fetchHomeFeeds();
  }, []);

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* 1. HERO BANNER SLIDER CONTAINER */}
      {banners.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 aspect-[18/9] sm:aspect-[18/7] min-h-[160px] sm:min-h-[360px]">
          {/* Viewport */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full overflow-hidden relative"
          >
            {/* Track */}
            <div 
              className="flex transition-transform duration-500 ease-out w-full h-full"
              style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
            >
              {banners.map((banner) => (
                /* Slide */
                <div 
                  key={banner._id}
                  className="w-full min-w-full shrink-0 relative h-full flex flex-col justify-end pb-12 pt-6 px-6 sm:pb-24 sm:px-12 lg:pb-28 lg:px-20 min-h-[160px] sm:min-h-[360px] overflow-hidden"
                >
                  {/* Background Banner image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={getMediaUrl(banner.imageUrl, API_BASE_URL)} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover object-[60%_45%] scale-[1.20] brightness-[1.18] contrast-[1.12] saturate-[1.05] transition-all duration-700 ease-out"
                  />
                  {/* Left-to-right dark gradient for text readability (30-35% average opacity on right) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-zinc-950/15"></div>
                  {/* Bottom-to-top dark gradient for card-blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent"></div>
                  
                  {/* Banner Content overlay */}
                  <div className="relative max-w-xs sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 lg:space-y-7 z-10">
                    <h1 className="text-sm sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm line-clamp-2 leading-tight">
                      {banner.title}
                    </h1>
                    {banner.description && (
                      <p className="text-zinc-300 text-[10px] sm:text-sm font-medium line-clamp-2 leading-relaxed hidden sm:block">
                        {banner.description}
                      </p>
                    )}
                    
                    {/* Banner CTA link */}
                    <div className="pt-0.5 sm:pt-2">
                      <Link 
                        href={
                          banner.linkType === 'audio' 
                            ? `/audio/${banner.linkValue}` 
                            : banner.linkType === 'category' 
                            ? `/search?category=${encodeURIComponent(banner.linkValue)}` 
                            : banner.linkValue
                        }
                        className="inline-flex items-center justify-center gap-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm h-[40px] sm:h-[50px] px-6 sm:px-9 rounded-full transition-all cursor-pointer shadow-lg shadow-rose-500/35 hover:shadow-[0_0_20px_rgba(244,63,94,0.65)] hover:scale-[1.02] active:scale-98"
                      >
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        Listen Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Swiper Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${activeBannerIndex === idx ? 'w-4 bg-rose-500' : 'w-1.5 bg-zinc-600/70'
                    }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. CATEGORIES SELECTOR TABS - Premium Glassmorphic Cards */}
      {categories.length > 0 && (
        <section id="categories" className="space-y-6 scroll-mt-20">
          {/* Inline styles for animated gradient border */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes category-gradient-xy {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
            .animate-category-gradient {
              animation: category-gradient-xy 3s ease infinite;
              background-size: 200% auto;
            }
          `}} />

          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl px-4 sm:px-0">Browse Categories</h2>
          
          <div className="flex gap-[14px] overflow-x-auto pb-6 pt-2 no-scrollbar snap-x scroll-smooth px-4 sm:px-0">
            {categories.map((cat) => {
              const style = getCategoryStyle(cat.slug, cat.name);
              const Icon = style.icon;
              const isActive = activeCategory === cat.slug;
              
              return (
                <Link
                  key={cat._id}
                  href={`/search?category=${encodeURIComponent(cat.slug)}`}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`relative ${
                    isActive ? 'scale-[1.03] shadow-[0_0_25px_rgba(244,63,94,0.35)] z-10' : 'hover:scale-[1.03] active:scale-[0.98]'
                  } transition-all duration-300 ease-out shrink-0 snap-start select-none`}
                >
                  {/* Outer border wrapper (1px border simulation) */}
                  <div className={`p-[1px] rounded-[20px] sm:rounded-[24px] ${
                    isActive 
                      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 animate-category-gradient' 
                      : 'bg-white/[0.08] hover:bg-white/[0.15]'
                  } transition-all duration-300`}>
                    
                    {/* Inner card content */}
                    <div 
                      className={`w-[130px] sm:w-[180px] h-[72px] sm:h-[88px] rounded-[19px] sm:rounded-[23px] flex flex-col justify-between p-3.5 ${
                        isActive 
                          ? 'bg-zinc-950/90' 
                          : 'bg-white/[0.04]'
                      } transition-all duration-300`}
                      style={{
                        boxShadow: isActive ? '0 12px 35px rgba(0,0,0,0.5)' : '0 12px 35px rgba(0,0,0,0.35)'
                      }}
                    >
                      {/* Top: Icon */}
                      <div className="flex items-center">
                        <Icon 
                          className={`h-4.5 w-4.5 sm:h-6 sm:w-6 transition-all duration-300`} 
                          style={{ 
                            color: style.color,
                            fill: (isActive && style.iconFilled) ? style.color : 'transparent' 
                          }} 
                        />
                      </div>
                      
                      {/* Center/Bottom Info */}
                      <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="text-xs sm:text-[18px] font-semibold tracking-tight text-white leading-tight truncate">
                          {cat.name}
                        </h3>
                        <p className="text-[9px] sm:text-[12px] font-medium text-zinc-400 opacity-65 leading-none">
                          {style.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. RECENTLY LISTENED SHELF */}
      {recentlyListened && recentlyListened.length > 0 && (
        <section id="recently-listened" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Recently Listened</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x scroll-smooth">
            {recentlyListened.map((item) => (
              <AudioCard
                key={item.audio._id}
                audio={item.audio}
                queueList={recentlyListened.map(r => r.audio)}
                progress={item.progress}
                className="w-36"
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. FEEDS GRID ROWS */}
      <section className="space-y-10">
        <AudioRow title="Featured Audiobooks" data={featured} />
        <AudioRow title="Trending Now" data={trending} />
        <AudioRow title="Latest Releases" data={latest} />
      </section>

    </div>
  );
}
