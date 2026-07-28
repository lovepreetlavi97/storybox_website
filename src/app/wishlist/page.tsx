'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAudioPlayer } from '@/hooks';
import { AudioCard } from '@/components/features';

export default function WishlistPage() {
  const { wishlist } = useAudioPlayer();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[60vh]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Wishlist</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          {wishlist.length === 1 
            ? '1 audiobook saved for later' 
            : `${wishlist.length} audiobooks saved for later`}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 max-w-md mx-auto">
          <Heart className="h-12 w-12 text-zinc-700 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            Explore our collection of audiobooks and click the heart icon on any cover to save it here.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center bg-rose-500 hover:bg-rose-600 px-6 py-2.5 rounded-full font-bold text-white transition-all text-sm shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            Explore Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {wishlist.map((audio) => (
            <AudioCard 
              key={audio._id}
              audio={audio}
              queueList={wishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
