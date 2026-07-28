import { API_BASE_URL } from '@/constants/config';
import { ApiResponse, IAudio, IBanner, ICategory } from '@/types';

export const publicService = {
  async fetchBanners(): Promise<ApiResponse<IBanner[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/banners`);
      if (!res.ok) throw new Error('Failed to fetch banners');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching banners:', err);
      return { success: false, data: [] };
    }
  },

  async fetchFeaturedAudios(): Promise<ApiResponse<IAudio[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/audios/featured`);
      if (!res.ok) throw new Error('Failed to fetch featured audios');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching featured audios:', err);
      return { success: false, data: [] };
    }
  },

  async fetchTrendingAudios(): Promise<ApiResponse<IAudio[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/audios/trending`);
      if (!res.ok) throw new Error('Failed to fetch trending audios');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching trending audios:', err);
      return { success: false, data: [] };
    }
  },

  async fetchLatestAudios(): Promise<ApiResponse<IAudio[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/audios/latest`);
      if (!res.ok) throw new Error('Failed to fetch latest audios');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching latest audios:', err);
      return { success: false, data: [] };
    }
  },

  async fetchCategories(): Promise<ApiResponse<ICategory[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (err) {
      console.warn('Error fetching categories:', err);
      return { success: false, data: [] };
    }
  },

  async searchAudios(query?: string, category?: string): Promise<ApiResponse<IAudio[]>> {
    try {
      const qQuery = query ? `q=${encodeURIComponent(query)}` : '';
      const catQuery = category ? `category=${encodeURIComponent(category)}` : '';
      const params = [qQuery, catQuery].filter(Boolean).join('&');
      const url = `${API_BASE_URL}/api/public/audios/search?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to search audios');
      return await res.json();
    } catch (err) {
      console.warn('Error searching audios:', err);
      return { success: false, data: [] };
    }
  },

  async getAudioBySlug(slug: string): Promise<ApiResponse<IAudio>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/audios/${slug}`);
      if (!res.ok) throw new Error('Failed to get audio by slug');
      return await res.json();
    } catch (err: any) {
      console.warn('Error getting audio by slug:', err);
      return { success: false, error: err.message || 'Audio not found' };
    }
  }
};
