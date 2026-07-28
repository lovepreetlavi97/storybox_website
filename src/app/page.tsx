'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, BookOpen } from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { publicService } from '@/services';
import { IAudio, IBanner, ICategory } from '@/types';
import { getMediaUrl } from '@/utils';
import { API_BASE_URL } from '@/constants/config';
import { AudioRow, AudioCard } from '@/components/features';

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

  const handleBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveBannerIndex(index);
    }
  };

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
        <section className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900">
          <div
            onScroll={handleBannerScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar aspect-[21/9] lg:aspect-[24/9] min-h-[130px] sm:min-h-[300px]"
          >
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="w-full shrink-0 snap-start relative h-full flex flex-col justify-end pb-8 pt-5 px-5 sm:p-8 lg:p-12 min-h-[130px] sm:min-h-[300px]"
              >
                {/* Background Banner image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(banner.imageUrl, API_BASE_URL)}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
                />
                {/* Dark overlay gradient for strong readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/30"></div>

                {/* Banner Content overlay */}
                <div className="relative max-w-lg space-y-2 sm:space-y-3 z-10">
                  <h1 className="text-xs sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm line-clamp-2 leading-tight">
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
                      className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] sm:text-xs px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-500/20"
                    >
                      <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current ml-0.5" />
                      Listen Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Swiper Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banners.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === idx ? 'w-4 bg-rose-500' : 'w-1.5 bg-zinc-600/70'
                    }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. CATEGORIES SELECTOR TABS */}
      {categories.length > 0 && (
        <section id="categories" className="space-y-4 scroll-mt-20">
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
