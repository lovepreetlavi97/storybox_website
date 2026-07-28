'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IAudio } from '@/types';
import { AudioCard } from './AudioCard';

interface AudioRowProps {
  title: string;
  data: IAudio[];
}

export function AudioRow({ title, data }: AudioRowProps) {
  if (!data || data.length === 0) return null;

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
        {data.map((audio) => (
          <AudioCard key={audio._id} audio={audio} queueList={data} />
        ))}
      </div>
    </div>
  );
}
