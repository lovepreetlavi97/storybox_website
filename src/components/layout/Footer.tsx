'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900/60 mt-16 py-8 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500">
          {/* <div className="flex flex-wrap justify-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Report Abuse (DMCA)</span>
          </div> */}
          <p className="text-center md:text-right font-medium text-zinc-400">
            &copy; {new Date().getFullYear()} StoryHub. All rights reserved. Stories that stay.
          </p>
        </div>

      </div>
    </footer>
  );
}
