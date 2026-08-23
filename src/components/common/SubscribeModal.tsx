'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Sparkles, X, Headphones } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SubscribeModal({
  isOpen,
  onClose,
  title = "Unlock Full Audiobooks with StoryHub VIP",
  message = "You've enjoyed your free demo preview! Subscribe for just 15 KSH/Daily to get unlimited access to all audiobooks, full series, and ad-free listening."
}: SubscribeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          title="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs">
            {message}
          </p>
        </div>

        {/* Feature Badges */}
        <div className="space-y-2 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Unlimited HD Audiobook Streaming</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Ad-free experience on all devices</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="space-y-3 pt-1">
          <Link
            href="/subscribe"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 text-center block"
          >
            <span>Subscribe VIP (15 KSH/Daily)</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors text-center"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
