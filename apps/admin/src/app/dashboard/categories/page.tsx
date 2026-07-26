'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderKanban, X } from 'lucide-react';
import { apiRequest } from '../../../utils/api';
import { ApiResponse, ICategory } from 'shared';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await apiRequest<ApiResponse<ICategory[]>>('/admin/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setError(res.error || 'Failed to fetch categories');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      // Auto slugify name: lowercase, swap spaces for hyphens, remove non-alphanumeric except hyphens
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleOpenModal = (cat?: ICategory) => {
    if (cat) {
      setEditingId(cat._id);
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || '');
    } else {
      setEditingId(null);
      setName('');
      setSlug('');
      setDescription('');
    }
    setError('');
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Name and slug are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
      const res = await apiRequest<ApiResponse<ICategory>>(endpoint, {
        method,
        body: JSON.stringify({ name, slug, description }),
      });

      if (res.success) {
        fetchCategories();
        handleCloseModal();
      } else {
        setError(res.error || 'Failed to save category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await apiRequest<ApiResponse<any>>(`/admin/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setCategories(categories.filter(c => c._id !== id));
      } else {
        alert(res.error || 'Failed to delete category');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Categories</h1>
          <p className="text-zinc-400 mt-1">Organize your streaming files by genres or topics</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all cursor-pointer text-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div 
                key={cat._id} 
                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/85 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors">{cat.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 w-fit">
                    /{cat.slug}
                  </p>
                  <p className="text-zinc-400 text-sm mt-3.5 line-clamp-3 min-h-[42px] leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-800/60">
                  <button
                    onClick={() => handleOpenModal(cat)}
                    className="p-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-800"
                    title="Edit Category"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 rounded-lg bg-zinc-850 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-zinc-800 hover:border-rose-900/30"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
              <p className="font-semibold text-zinc-400">No categories found</p>
              <p className="text-sm mt-1">Get started by creating your first audiobook category.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
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
              {editingId ? 'Edit Category' : 'Create Category'}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Historical Biography"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. historical-biography"
                  className="w-full rounded-lg bg-zinc-850 border border-zinc-700/60 px-4 py-2 text-zinc-400 font-mono focus:outline-none text-sm"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Provide a brief description of what files belong in this category..."
                  rows={4}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors text-sm resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

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
                  disabled={submitting}
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
