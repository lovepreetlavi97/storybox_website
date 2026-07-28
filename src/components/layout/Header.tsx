'use client';

import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Brand info */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group font-semibold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/storyhublogo.png" 
              alt="StoryHub Logo" 
              className="h-9 w-auto object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform" 
            />
            <span className="font-extrabold text-lg tracking-tight text-white transition-colors group-hover:text-red-500">
              Story<span className="text-red-500">Hub</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
            <Link href="/" className="text-white hover:text-red-500 transition-colors">Popular</Link>
            <Link href="/" className="hover:text-red-500 transition-colors">Audiobooks</Link>
            <Link href="/" className="hover:text-red-500 transition-colors">Originals</Link>
            <Link href="/" className="hover:text-red-500 transition-colors text-red-500">New & Hot</Link>
          </nav>
        </div>

        {/* Right Menu Controls */}
        <div className="flex items-center gap-5">
          {/* Search Bar Icon */}
          <Link 
            href="/search" 
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-all"
            title="Search audiobooks"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
