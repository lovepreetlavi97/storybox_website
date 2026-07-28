import { API_BASE_URL } from '@/constants/config';
import { ApiResponse, IAudio, IBanner, ICategory } from '@/types';

export const publicService = {
  async fetchBanners(): Promise<ApiResponse<IBanner[]>> {
    const res = await fetch(`${API_BASE_URL}/api/public/banners`);
    return res.json();
  },

  async fetchFeaturedAudios(): Promise<ApiResponse<IAudio[]>> {
    const res = await fetch(`${API_BASE_URL}/api/public/audios/featured`);
    return res.json();
  },

  async fetchTrendingAudios(): Promise<ApiResponse<IAudio[]>> {
    const res = await fetch(`${API_BASE_URL}/api/public/audios/trending`);
    return res.json();
  },

  async fetchLatestAudios(): Promise<ApiResponse<IAudio[]>> {
    const res = await fetch(`${API_BASE_URL}/api/public/audios/latest`);
    return res.json();
  },

  async fetchCategories(): Promise<ApiResponse<ICategory[]>> {
    const res = await fetch(`${API_BASE_URL}/api/public/categories`);
    return res.json();
  },

  async searchAudios(query?: string, category?: string): Promise<ApiResponse<IAudio[]>> {
    const qQuery = query ? `q=${encodeURIComponent(query)}` : '';
    const catQuery = category ? `category=${encodeURIComponent(category)}` : '';
    const params = [qQuery, catQuery].filter(Boolean).join('&');
    const url = `${API_BASE_URL}/api/public/audios/search?${params}`;

    const res = await fetch(url);
    return res.json();
  },

  async getAudioBySlug(slug: string): Promise<ApiResponse<IAudio>> {
    const res = await fetch(`${API_BASE_URL}/api/public/audio/${slug}`);
    return res.json();
  }
};
