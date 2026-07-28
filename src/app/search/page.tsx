'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, VolumeX, X, FolderKanban } from 'lucide-react';
import { publicService } from '@/services';
import { IAudio, ICategory } from '@/types';
import { AudioCard } from '@/components/features';

function SearchContent() {
  const searchParams = useSearchParams();

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
        const data = await publicService.fetchCategories();
        if (data.success && data.data) {
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
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedCategory]);

  const triggerSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await publicService.searchAudios(query, selectedCategory);
      if (data.success && data.data) {
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
            {results.map((audio) => (
              <AudioCard key={audio._id} audio={audio} queueList={results} />
            ))}
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
