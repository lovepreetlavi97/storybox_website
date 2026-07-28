import { API_BASE_URL } from '@/constants/config';

/**
 * Dynamically resolves media URLs (thumbnails, audio tracks, banners).
 * Handles absolute URLs (http, https, blob, data), relative server upload paths,
 * and fallbacks.
 */
export function getMediaUrl(url?: string | null, defaultBaseUrl: string = API_BASE_URL): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  let cleanBase = defaultBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  if (!cleanBase || cleanBase.startsWith('/')) {
    cleanBase = 'http://3.82.47.4:5000';
  }
  return `${cleanBase}${cleanUrl}`;
}
