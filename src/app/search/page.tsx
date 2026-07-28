'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, VolumeX, Play, Pause, X, Clock, FolderKanban } from 'lucide-react';
import { useAudioPlayer, API_BASE_URL } from '../../context/AudioContext';
import { IAudio, ICategory, getMediaUrl, formatDuration } from 'shared';

function SearchContent() {
  const searchParams = useSearchParams();
  const { currentAudio, isPlaying, playAudio } = useAudioPlayer();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<IAudio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to load categories for search page:', err);
      }
    }
    loadCategories();

    // Pull from url query params if present
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || '';
    
    if (qParam) setQuery(qParam);
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  // Handle live search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      triggerSearch();
    }, 200); // short debounce to prevent keypress overload

    return () => clearTimeout(delayDebounce);
  }, [query, selectedCategory]);

  const triggerSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const qQuery = query ? `q=${encodeURIComponent(query)}` : '';
      const catQuery = selectedCategory ? `category=${encodeURIComponent(selectedCategory)}` : '';
      const params = [qQuery, catQuery].filter(Boolean).join('&');
      const url = `${API_BASE_URL}/api/public/audios/search?${params}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search api failed:', err);
      setError('Network communication failure');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Search</h1>
        <p className="text-zinc-400 mt-1">Search through titles, genres and categories</p>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input box */}
        <div className="md:col-span-2 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4.5 py-3.5 focus-within:border-zinc-700 transition-colors">
          <SearchIcon className="h-5.5 w-5.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="What audiobook do you want to listen to?"
            className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={handleClear}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Category selector */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4.5 py-3">
          <FolderKanban className="h-5 w-5 text-rose-500 shrink-0 mr-3" />
          <select
            className="w-full bg-transparent border-none text-zinc-300 focus:outline-none text-sm cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="" className="bg-zinc-900 text-zinc-300">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug} className="bg-zinc-900 text-zinc-300">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {loading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-rose-400 font-semibold">{error}</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {results.map((audio) => {
              const isCurrent = currentAudio?._id === audio._id;
              const isPlayingThis = isCurrent && isPlaying;

              return (
                <div 
                  key={audio._id}
                  className="bg-transparent p-1.5 transition-all duration-500 hover:-translate-y-1.5 group relative"
                >
                  <Link href={`/audio/${audio.slug}`} className="block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.03] transition-all duration-550 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:border-white/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={getMediaUrl(audio.thumbnailUrl, API_BASE_URL)} 
                        alt={audio.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                        loading="lazy"
                      />

                      {/* Gradient Overlay for luxury touch */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playAudio(audio, results);
                        }}
                        className={`absolute bottom-2.5 right-2.5 h-8.5 w-8.5 rounded-full bg-white/90 hover:bg-rose-500 text-zinc-900 hover:text-white backdrop-blur-sm flex items-center justify-center shadow-xl shadow-black/25 hover:shadow-rose-500/30 hover:scale-105 transition-all duration-300 transform cursor-pointer ${
                          isCurrent 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-90 translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                        }`}
                      >
                        {isPlayingThis ? (
                          <Pause className="h-4 w-4 fill-current ml-0" />
                        ) : (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        )}
                      </button>


                    </div>

                    <h3 className="font-extrabold text-sm text-zinc-100 tracking-tight group-hover:text-rose-400 transition-colors duration-300 line-clamp-1 mt-1">
                      {itemTitle(audio.title)}
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
        ) : (
          <div className="py-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            <VolumeX className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
            <p className="font-semibold text-zinc-400">No audio tracks matched your search</p>
            <p className="text-sm mt-1">Try refining your keyword query or changing category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function itemTitle(title: string) {
  return title;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[75vh] items-center justify-center bg-zinc-950">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
