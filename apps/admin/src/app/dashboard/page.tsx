'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Music, 
  Image as ImageIcon, 
  Plus, 
  ArrowRight, 
  FileAudio,
  Calendar,
  Volume2
} from 'lucide-react';
import { apiRequest, SERVER_BASE_URL } from '../../utils/api';
import { ApiResponse, IAudio, getMediaUrl } from 'shared';

interface DashboardStats {
  totalAudios: number;
  totalCategories: number;
  totalBanners: number;
  latestAudios: (IAudio & { category: { name: string } })[];
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiRequest<ApiResponse<DashboardStats>>('/admin/dashboard');
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.error || 'Failed to fetch dashboard metrics');
        }
      } catch (err: any) {
        setError(err.message || 'Connection to server failed');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-6 text-center max-w-xl mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Error Loading Dashboard</h2>
        <p className="text-zinc-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white font-medium cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Audiobooks',
      value: stats?.totalAudios || 0,
      icon: Music,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      href: '/dashboard/audio'
    },
    {
      name: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderKanban,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      href: '/dashboard/categories'
    },
    {
      name: 'Hero Banners',
      value: stats?.totalBanners || 0,
      icon: ImageIcon,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      href: '/dashboard/banners'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-400 mt-1">Status dashboard for audio streaming content</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/audio"
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            New Audio
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link 
              key={card.name} 
              href={card.href} 
              className={`flex items-center justify-between p-6 rounded-2xl bg-zinc-900 border transition-all hover:scale-[1.02] hover:bg-zinc-800/80 cursor-pointer ${card.color}`}
            >
              <div>
                <p className="text-sm font-medium text-zinc-400">{card.name}</p>
                <p className="text-3xl font-bold mt-2 text-white">{card.value}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recents list */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-rose-500" />
            Recently Uploaded Audio
          </h2>
          <Link
            href="/dashboard/audio"
            className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 font-semibold group transition-all"
          >
            Manage Audios
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {stats?.latestAudios && stats.latestAudios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/50">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                {stats.latestAudios.map((audio) => (
                  <tr key={audio._id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      {audio.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getMediaUrl(audio.thumbnailUrl, SERVER_BASE_URL)} 
                          alt={audio.title} 
                          className="h-10 w-10 rounded-lg object-cover bg-zinc-800 border border-zinc-800"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-800">
                          <FileAudio className="h-5 w-5 text-zinc-400" />
                        </div>
                      )}
                      <span className="truncate max-w-[200px]">{audio.title}</span>
                    </td>
                    <td className="px-6 py-4">{audio.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-xs bg-zinc-800/30 w-fit rounded px-2.5 py-0.5 border border-zinc-800">{audio.language}</td>
                    <td className="px-6 py-4">
                      {audio.published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 flex items-center gap-1 mt-2.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(audio.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            <FileAudio className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p>No audio files uploaded yet.</p>
            <p className="text-sm mt-1 text-zinc-600">Start uploading files to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
