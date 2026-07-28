'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, 
  Upload, FileAudio, Check, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { apiRequest, SERVER_BASE_URL } from '../../../utils/api';
import { ApiResponse, IAudio, ICategory, PaginatedResponse, getMediaUrl } from 'shared';

export default function AudioPage() {
  const [audios, setAudios] = useState<IAudio[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [published, setPublished] = useState(true);

  // File Upload State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailLoading, setThumbnailLoading] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [duration, setDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch categories
      const catRes = await apiRequest<ApiResponse<ICategory[]>>('/admin/categories');
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // Fetch audios
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const audioRes = await apiRequest<PaginatedResponse<IAudio>>(
        `/admin/audios?page=${currentPage}&limit=${limit}${searchParam}`
      );

      if (audioRes.success && audioRes.data) {
        setAudios(audioRes.data);
        if (audioRes.pagination) {
          setTotalPages(audioRes.pagination.pages || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  // Thumbnail File Select
  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    // Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setThumbnailUrl(localPreviewUrl);
    setThumbnailLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiRequest<ApiResponse<{ url: string }>>('/admin/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setThumbnailUrl(res.data.url);
      } else {
        setError(res.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Image upload request failed');
    } finally {
      setThumbnailLoading(false);
    }
  };

  // Audio File Select
  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setAudioLoading(true);
    setError('');

    // Capture duration using web Audio API locally
    try {
      const audioEl = document.createElement('audio');
      audioEl.src = URL.createObjectURL(file);
      audioEl.addEventListener('loadedmetadata', () => {
        setDuration(Math.round(audioEl.duration));
      });
    } catch (err) {
      console.error('Failed to parse duration client-side:', err);
    }

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await apiRequest<ApiResponse<{ url: string }>>('/admin/upload/audio', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setAudioUrl(res.data.url);
      } else {
        setError(res.error || 'Failed to upload audio');
      }
    } catch (err: any) {
      setError(err.message || 'Audio upload request failed');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleOpenModal = (audio?: IAudio) => {
    setError('');
    if (audio) {
      setEditingId(audio._id);
      setTitle(audio.title);
      setSlug(audio.slug);
      setDescription(audio.description);
      setCategoryId(typeof audio.category === 'object' ? (audio.category as any)._id : audio.category);
      setLanguage(audio.language);
      setFeatured(audio.featured);
      setTrending(audio.trending);
      setPublished(audio.published);
      setThumbnailUrl(audio.thumbnailUrl);
      setAudioUrl(audio.audioUrl);
      setDuration(audio.duration);
    } else {
      setEditingId(null);
      setTitle('');
      setSlug('');
      setDescription('');
      setCategoryId(categories[0]?._id || '');
      setLanguage('Hindi');
      setFeatured(false);
      setTrending(false);
      setPublished(true);
      setThumbnailUrl('');
      setAudioUrl('');
      setDuration(0);
      setThumbnailFile(null);
      setAudioFile(null);
    }
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !slug || !categoryId || !thumbnailUrl || !audioUrl) {
      setError('Please fill in all required fields and upload thumbnail/audio.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      description,
      slug,
      thumbnailUrl,
      audioUrl,
      duration,
      category: categoryId,
      language,
      featured,
      trending,
      published
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/admin/audios/${editingId}` : '/admin/audios';
      const res = await apiRequest<ApiResponse<IAudio>>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        fetchData();
        handleCloseModal();
      } else {
        setError(res.error || 'Failed to save audio file details');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving audio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio? All local files will be removed.')) return;
    
    try {
      const res = await apiRequest<ApiResponse<any>>(`/admin/audios/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setAudios(audios.filter(a => a._id !== id));
      } else {
        alert(res.error || 'Failed to delete audio');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete audio');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Audio Files</h1>
          <p className="text-zinc-400 mt-1">Manage, upload and preview audio titles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all cursor-pointer text-sm self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Upload Audio
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex gap-4 max-w-md bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 items-center">
        <Search className="h-5 w-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by title..."
          className="bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-sm w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to page 1 on search
          }}
        />
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          {audios.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/50">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Language</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Attributes</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                    {audios.map((audio) => (
                      <tr key={audio._id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={getMediaUrl(audio.thumbnailUrl, SERVER_BASE_URL)} 
                            alt={audio.title} 
                            className="h-12 w-12 rounded-lg object-cover bg-zinc-800 border border-zinc-800"
                          />
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px]">{audio.title}</span>
                            <span className="text-xs text-zinc-500 font-mono">/{audio.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{(audio.category as any)?.name || 'N/A'}</td>
                        <td className="px-6 py-4 font-medium text-xs">
                          <span className="bg-zinc-850 px-2.5 py-0.5 rounded border border-zinc-800">{audio.language}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-400">{formatDuration(audio.duration)}</td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {audio.featured && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            {audio.trending && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                Trending
                              </span>
                            )}
                            {audio.published ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                Live
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
                                Draft
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(audio)}
                              className="p-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-800"
                              title="Edit Audio"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(audio._id)}
                              className="p-2 rounded-lg bg-zinc-850 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-zinc-800 hover:border-rose-900/30"
                              title="Delete Audio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-zinc-850 text-zinc-400 hover:text-white disabled:opacity-30 border border-zinc-800 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-zinc-850 text-zinc-400 hover:text-white disabled:opacity-30 border border-zinc-800 transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-16 text-center text-zinc-500">
              <FileAudio className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
              <p className="font-semibold text-zinc-400">No audio tracks found</p>
              <p className="text-sm mt-1">Start uploading cover images and MP3 files to construct your catalog.</p>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD / EDIT AUDIO MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Audio Details' : 'Upload New Audio'}
            </h2>

            {error && (
              <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-sm text-rose-400 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image and Audio Uploads */}
                <div className="space-y-5">
                  {/* Thumbnail upload box */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Cover Thumbnail (Image) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailSelect}
                    />
                    
                    {thumbnailUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 h-44 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={getMediaUrl(thumbnailUrl, SERVER_BASE_URL)} 
                          alt="Cover Thumbnail" 
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-semibold transition-opacity text-sm cursor-pointer"
                        >
                          <Upload className="h-5 w-5" />
                          Change Cover
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={thumbnailLoading}
                        className="w-full border-2 border-dashed border-zinc-800 rounded-xl h-44 bg-zinc-950 hover:border-zinc-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-400"
                      >
                        {thumbnailLoading ? (
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8" />
                            <span className="text-sm font-medium">Upload Image Cover</span>
                            <span className="text-xs text-zinc-600">JPG, PNG, WebP up to 5MB</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Audio upload box */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Audio File (MP3) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleAudioSelect}
                    />

                    {audioUrl ? (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
                            <FileAudio className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                              {audioFile ? audioFile.name : 'Audio track is live'}
                            </p>
                            <p className="text-xs text-zinc-500 font-mono">
                              Duration: {formatDuration(duration)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer border border-rose-500/10 bg-rose-500/5 px-3 py-1.5 rounded-lg"
                        >
                          Change MP3
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={audioLoading}
                        className="w-full border-2 border-dashed border-zinc-800 rounded-xl py-8 bg-zinc-950 hover:border-zinc-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-400"
                      >
                        {audioLoading ? (
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
                        ) : (
                          <>
                            <FileAudio className="h-8 w-8" />
                            <span className="text-sm font-medium">Select MP3 Audio File</span>
                            <span className="text-xs text-zinc-600">MP3, M4A or WAV format</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Audio Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rich Dad Poor Dad (Hindi)"
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Slug <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="rich-dad-poor-dad-hindi"
                      className="w-full rounded-lg bg-zinc-850 border border-zinc-700 px-4 py-2 text-zinc-300 font-mono focus:outline-none focus:border-rose-500 text-sm"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={submitting}
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Language <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Hindi, English, etc."
                        className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      placeholder="Write an engaging overview summary of this audiobook..."
                      rows={4}
                      required
                      className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox settings */}
              <div className="flex flex-wrap gap-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-zinc-700 text-rose-500 focus:ring-rose-500/20 bg-zinc-800"
                  />
                  <div>
                    <span className="font-semibold text-white">Featured Audio</span>
                    <p className="text-xs text-zinc-500">Showcase in front banner feeds</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={(e) => setTrending(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-zinc-700 text-rose-500 focus:ring-rose-500/20 bg-zinc-800"
                  />
                  <div>
                    <span className="font-semibold text-white">Trending Audio</span>
                    <p className="text-xs text-zinc-500">Display in trending sections</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-zinc-700 text-rose-500 focus:ring-rose-500/20 bg-zinc-800"
                  />
                  <div>
                    <span className="font-semibold text-white">Published</span>
                    <p className="text-xs text-zinc-500">Visible to site visitors</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-sm font-semibold text-white transition-all cursor-pointer border border-zinc-700"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white transition-all cursor-pointer"
                  disabled={submitting || thumbnailLoading || audioLoading}
                >
                  {submitting ? 'Saving...' : 'Save Audio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
