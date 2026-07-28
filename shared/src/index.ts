export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAudio {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  category: string; // Category ID or name? Standard: Reference to Category ID, or populate
  language: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBanner {
  _id: string;
  imageUrl: string;
  title: string;
  description?: string;
  linkType: 'audio' | 'category' | 'external';
  linkValue: string; // Slug or external URL
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISettings {
  _id?: string;
  appTitle: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  supportText?: string;
  updatedAt?: string;
}

export interface IAdmin {
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Dynamically resolves media URLs (thumbnails, audio tracks, banners).
 * Handles absolute URLs (http, https, blob, data), relative server upload paths,
 * and fallbacks.
 */
export function getMediaUrl(url?: string | null, defaultBaseUrl: string = 'http://3.82.47.4:5000'): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const cleanBase = defaultBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
}

/**
 * Formats duration seconds into readable time (M:SS).
 */
export function formatDuration(secs?: number): string {
  if (secs === undefined || secs === null || isNaN(secs) || secs <= 0) {
    return '0:00';
  }
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
}

