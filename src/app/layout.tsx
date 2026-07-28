import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import './globals.css';
import { AudioPlayerProvider } from '../context/AudioContext';
import StickyPlayer from '../components/Player';

export const metadata: Metadata = {
  title: 'StoryBox - Listen to Premium Audiobooks & Stories',
  description: 'Stream unlimited futuristic audiobooks, biography summaries, and audio stories in English.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const genres = ['Love', 'Personal Finance', 'Historical', 'Information', 'Career', 'Self Help', 'Religion'];
  const generals = ['Help & Support', 'Contact us', 'Studio for Creators', 'Download StoryBox'];
  const companies = ['About us', 'Careers', 'Team', 'Collaborate'];

  return (
    <html lang="en" className="h-full scroll-smooth antialiased dark">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 pb-28">
        <AudioPlayerProvider>
          {/* HEADER HEADER */}
          <header className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur border-b border-zinc-900/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              
              {/* Left Brand info */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2.5 group font-semibold">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-md shadow-cyan-500/10 group-hover:scale-105 transition-all overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-rose-500 opacity-25 group-hover:opacity-45 transition-opacity"></div>
                    <svg className="h-5.5 w-5.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <span className="font-extrabold text-lg tracking-tight text-white transition-colors group-hover:text-cyan-400">
                    Story<span className="text-cyan-400">Box</span>
                  </span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
                  <Link href="/" className="text-white hover:text-rose-500 transition-colors">Popular</Link>
                  <Link href="/" className="hover:text-rose-500 transition-colors">Audiobooks</Link>
                  <Link href="/" className="hover:text-rose-500 transition-colors">Originals</Link>
                  <Link href="/" className="hover:text-rose-500 transition-colors text-rose-500">New & Hot</Link>
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

                {/* Header controls */}


              </div>

            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="bg-zinc-950 border-t border-zinc-900/60 mt-16 pt-16 pb-8 text-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {/* Columns */}
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">Genres</h4>
                  <ul className="space-y-2 text-zinc-400">
                    {genres.map((g) => (
                      <li key={g}>
                        <Link href={`/search?q=${encodeURIComponent(g)}`} className="hover:text-rose-500 transition-colors">
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
                        className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer capitalize text-xs"
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
                  &copy; {new Date().getFullYear()} StoryBox. Built for ultra-fast, lightweight streaming.
                </p>
              </div>

            </div>
          </footer>

          {/* PERSISTENT STICKY PLAYER */}
          <StickyPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
