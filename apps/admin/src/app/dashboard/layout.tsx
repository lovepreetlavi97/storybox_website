'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Music, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { getAuthToken, removeAuthToken } from '../../utils/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Categories', href: '/dashboard/categories', icon: FolderKanban },
    { name: 'Audio Files', href: '/dashboard/audio', icon: Music },
    { name: 'Hero Banners', href: '/dashboard/banners', icon: ImageIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 shadow-md shadow-cyan-500/10 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-rose-500 opacity-25"></div>
            <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tight text-white">
            Story<span className="text-cyan-400">Box</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-500/10' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex md:hidden items-center justify-between px-6 h-16 bg-zinc-900 border-b border-zinc-800 z-20">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 shadow-md overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-rose-500 opacity-25"></div>
              <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="font-black text-base tracking-tight">
              Story<span className="text-cyan-400">Box</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-zinc-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-zinc-950/95 z-10 flex flex-col p-6 space-y-6">
            <nav className="flex-1 space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      isActive 
                        ? 'bg-cyan-600 text-white' 
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 px-5 py-3.5 rounded-xl text-base font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-all border border-cyan-500/20"
            >
              <LogOut className="h-6 w-6" />
              Logout
            </button>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
