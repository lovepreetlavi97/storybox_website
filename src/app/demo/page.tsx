'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Crown, Headphones, Volume2, ArrowRight } from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { publicService } from '@/services';
import { IAudio } from '@/types';
import { getMediaUrl } from '@/utils';
import { API_BASE_URL } from '@/constants/config';

export default function FreeDemoPage() {
  const { playAudio, currentAudio, isPlaying, openSubscribeModal } = useAudioPlayer();
  const [featuredAudios, setFeaturedAudios] = useState<IAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyDemoCount, setDailyDemoCount] = useState(0);
  const maxDemoListens = 5;

  useEffect(() => {
    // Check daily demo listens count from localStorage
    const todayKey = `demo_listens_${new Date().toISOString().split('T')[0]}`;
    const count = parseInt(localStorage.getItem(todayKey) || '0', 10);
    setDailyDemoCount(count);

    async function loadDemoFeeds() {
      try {
        const res = await publicService.fetchFeaturedAudios();
        if (res.success && res.data) {
          setFeaturedAudios(res.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load demo audios:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDemoFeeds();
  }, []);

  const handleDemoPlay = (audio: IAudio) => {
    const todayKey = `demo_listens_${new Date().toISOString().split('T')[0]}`;
    const currentCount = parseInt(localStorage.getItem(todayKey) || '0', 10);

    if (currentCount >= maxDemoListens) {
      openSubscribeModal(
        "Daily Demo Limit Reached",
        `You've reached your daily limit of ${maxDemoListens} free demo audio tracks. Subscribe to StoryHub VIP (15 KSH/Daily) for unlimited access to all full audiobooks!`
      );
      return;
    }

    // Increment demo count if starting new audio
    if (currentAudio?._id !== audio._id) {
      const newCount = currentCount + 1;
      localStorage.setItem(todayKey, newCount.toString());
      setDailyDemoCount(newCount);
    }

    playAudio(audio, featuredAudios);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-900 to-indigo-950 border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Free Demo Experience
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Listen & Experience StoryHub
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Sample our top audiobooks for free! Unsubscribed guest users can preview up to 5 tracks daily with a 60-second audio preview.
          </p>

          {/* DEMO COUNTER BADGE */}
          <div className="pt-2 flex items-center gap-4 flex-wrap">
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <Headphones className="w-5 h-5 text-rose-400" />
              <div className="text-xs">
                <span className="text-zinc-400 block">Today&apos;s Demo Listens</span>
                <span className="font-extrabold text-white text-sm">
                  {dailyDemoCount} / {maxDemoListens} Used
                </span>
              </div>
            </div>

            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Crown className="w-4 h-4" />
              <span>Unlock Unlimited VIP (15 KSH/Daily)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SAMPLE DEMO AUDIO TRACKS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-rose-500" /> Featured Sample Tracks
          </h2>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredAudios.map((audio) => {
              const isCurrent = currentAudio?._id === audio._id;
              return (
                <div
                  key={audio._id}
                  className={`relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'bg-rose-500/10 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(audio.thumbnailUrl, API_BASE_URL)}
                        alt={audio.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDemoPlay(audio)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 hover:scale-110 transition-transform"
                        title="Play Sample"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{audio.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {typeof audio.category === 'object' && audio.category ? (audio.category as any).name : (audio.category || 'StoryHub Featured')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDemoPlay(audio)}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{isCurrent && isPlaying ? 'Now Playing' : 'Play 60s Demo'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
