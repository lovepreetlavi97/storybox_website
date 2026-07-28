'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const genres = ['Love', 'Personal Finance', 'Historical', 'Information', 'Career', 'Self Help', 'Religion'];
  const generals = ['Help & Support', 'Contact us', 'Studio for Creators', 'Download StoryHub'];
  const companies = ['About us', 'Careers', 'Team', 'Collaborate'];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900/60 mt-16 pt-16 pb-8 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Columns */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Genres</h4>
            <ul className="space-y-2 text-zinc-400">
              {genres.map((g) => (
                <li key={g}>
                  <Link href={`/search?q=${encodeURIComponent(g)}`} className="hover:text-red-500 transition-colors">
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">General</h4>
            <ul className="space-y-2 text-zinc-400">
              {generals.map((g) => (
                <li key={g} className="hover:text-white transition-colors cursor-pointer">{g}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Company</h4>
            <ul className="space-y-2 text-zinc-400">
              {companies.map((c) => (
                <li key={c} className="hover:text-white transition-colors cursor-pointer">{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Connect with us</h4>
            <div className="flex flex-wrap gap-3.5">
              {['facebook', 'youtube', 'instagram', 'linkedin', 'twitter'].map((social) => (
                <div 
                  key={social} 
                  className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer capitalize text-xs"
                >
                  {social[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal and Copyright */}
        <div className="border-t border-zinc-900/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap justify-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Report Abuse (DMCA)</span>
          </div>
          <p className="text-center md:text-right">
            &copy; {new Date().getFullYear()} StoryHub. Built for ultra-fast, lightweight streaming.
          </p>
        </div>

      </div>
    </footer>
  );
}
