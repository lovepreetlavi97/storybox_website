'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Sparkles, Crown } from 'lucide-react';
import { useAudioPlayer } from '@/hooks';

export function Header() {
  const pathname = usePathname();
  const { wishlist, isSubscribed } = useAudioPlayer();

  if (pathname === '/subscribe' || pathname === '/redirect') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Brand info */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/storyhublogo.png" 
              alt="StoryHub Logo" 
              className="h-12 w-auto object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform" 
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
            <Link href="/demo" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Free Demo</span>
            </Link>
            <Link href="/#trending" className="hover:text-rose-500 transition-colors">Popular</Link>
            <Link href="/#recently-listened" className="hover:text-rose-500 transition-colors">Recently Listened</Link>
            <Link href="/#categories" className="hover:text-rose-500 transition-colors">Categories</Link>
          </nav>
        </div>

        {/* Right Menu Controls */}
        <div className="flex items-center gap-2">
          {/* Free Demo Mobile Link */}
          <Link
            href="/demo"
            className="md:hidden px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-full flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo</span>
          </Link>

          {/* Wishlist Heart Icon */}
          <Link 
            href="/wishlist" 
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-all relative"
            title="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-black text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center border border-zinc-950 shadow-md">
                {wishlist.length}
              </span>
            )}
          </Link>
          
          {/* Search Bar Icon */}
          <Link 
            href="/search" 
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-all"
            title="Search audiobooks"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Subscribe / VIP Status Button */}
          {isSubscribed ? (
            <div className="ml-2 px-3 py-1.5 bg-zinc-900 border border-amber-500/40 text-amber-400 font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-sm">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>VIP Active</span>
            </div>
          ) : (
            <Link
              href="/subscribe"
              className="ml-2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-amber-500/20 transition-all duration-300 transform active:scale-95 flex items-center gap-1.5"
            >
              <span>VIP Subscribe</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
