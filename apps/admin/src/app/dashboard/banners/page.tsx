'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Link2, Eye, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '../../../utils/api';
import { ApiResponse, IBanner } from 'shared';

export default function BannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkType, setLinkType] = useState<'audio' | 'category' | 'external'>('audio');
  const [linkValue, setLinkValue] = useState('');
  const [published, setPublished] = useState(true);

  // Upload fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const res = await apiRequest<ApiResponse<IBanner[]>>('/admin/banners');
      if (res.success && res.data) {
        setBanners(res.data);
      } else {
        setError(res.error || 'Failed to load banners');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiRequest<ApiResponse<{ url: string }>>('/admin/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setImageUrl(res.data.url);
      } else {
        setError(res.error || 'Failed to upload image file');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file to server');
    } finally {
      setImageLoading(false);
    }
  };

  const handleOpenModal = (banner?: IBanner) => {
    setError('');
    if (banner) {
      setEditingId(banner._id);
      setTitle(banner.title);
      setDescription(banner.description || '');
      setLinkType(banner.linkType);
      setLinkValue(banner.linkValue);
      setPublished(banner.published);
      setImageUrl(banner.imageUrl);
      setImageFile(null);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setLinkType('audio');
      setLinkValue('');
      setPublished(true);
      setImageUrl('');
      setImageFile(null);
    }
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !linkValue) {
      setError('Please provide title, banner image and redirect links');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      description,
      linkType,
      linkValue,
      published,
      imageUrl
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/admin/banners/${editingId}` : '/admin/banners';
      const res = await apiRequest<ApiResponse<IBanner>>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        fetchBanners();
        handleCloseModal();
      } else {
        setError(res.error || 'Failed to save banner');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving banner details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner? The image file will be cleaned up.')) return;

    try {
      const res = await apiRequest<ApiResponse<any>>(`/admin/banners/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setBanners(banners.filter(b => b._id !== id));
      } else {
        alert(res.error || 'Failed to delete banner');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hero Banners</h1>
          <p className="text-zinc-400 mt-1">Manage slides displayed at the top of homepage</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Banner
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.length > 0 ? (
            banners.map((banner) => (
              <div 
                key={banner._id} 
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-md group"
              >
                {/* Banner Thumbnail aspect-video */}
                <div className="relative aspect-[21/9] bg-zinc-950 overflow-hidden border-b border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `http://localhost:5000${banner.imageUrl}`}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-350"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {banner.published ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/85 text-white backdrop-blur shadow-sm uppercase tracking-wider">
                        Live
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/80 text-zinc-400 backdrop-blur shadow-sm border border-zinc-700 uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1.5">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed">{banner.description}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950/65 px-3 py-2 rounded-lg border border-zinc-850 w-fit">
                      <Link2 className="h-3.5 w-3.5 text-rose-500" />
                      <span className="font-semibold text-zinc-400 uppercase tracking-wider">{banner.linkType}:</span>
                      <span className="font-mono text-zinc-400 truncate max-w-[200px]">{banner.linkValue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-850">
                    <button
                      onClick={() => handleOpenModal(banner)}
                      className="p-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-800"
                      title="Edit Banner"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 rounded-lg bg-zinc-850 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-zinc-800 hover:border-rose-900/30"
                      title="Delete Banner"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
              <p className="font-semibold text-zinc-400">No banners found</p>
              <p className="text-sm mt-1">Upload wide banner covers to display in slider view on public site.</p>
            </div>
          )}
        </div>
      )}

      {/* BANNER EDIT/CREATE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Banner Details' : 'Create Hero Banner'}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Banner Image (Landscape 21:9 ratio) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                
                {imageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[21/9] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`} 
                      alt="Banner Preview" 
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-semibold transition-opacity text-sm cursor-pointer"
                    >
                      <Upload className="h-5 w-5" />
                      Replace Banner Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageLoading}
                    className="w-full border-2 border-dashed border-zinc-800 rounded-xl aspect-[21/9] bg-zinc-950 hover:border-zinc-700 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-400"
                  >
                    {imageLoading ? (
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8" />
                        <span className="text-sm font-medium">Upload Banner Cover</span>
                        <span className="text-xs text-zinc-600">Landscape 21:9 image recommended</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Listen to Premium Originals"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hindi audiobooks summarizing personal finance guides"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Link Redirect Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm"
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as any)}
                    disabled={submitting}
                  >
                    <option value="audio">Audio Page (by Slug)</option>
                    <option value="category">Category Page (by Slug)</option>
                    <option value="external">External Link URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Redirect Slug / URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={linkType === 'external' ? 'https://google.com' : 'e.g. rich-dad-poor-dad'}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm font-mono"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-sm pt-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-zinc-700 text-rose-500 focus:ring-rose-500/20 bg-zinc-800"
                />
                <div>
                  <span className="font-semibold text-white">Publish Banner</span>
                  <p className="text-xs text-zinc-500">Visible at top of website homepage</p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
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
                  className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-500/10"
                  disabled={submitting || imageLoading}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
