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
  
  if (cleanUrl.startsWith('/uploads/')) {
    return `https://xpernex-storage.s3.us-east-1.amazonaws.com${cleanUrl}`;
  }

  let cleanBase = defaultBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  if (!cleanBase || cleanBase.startsWith('/')) {
    cleanBase = typeof window !== 'undefined'
      ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000')
          : (window.location.protocol === 'https:' ? '' : 'https://storyhub.xpernex.com'))
      : (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') : 'https://storyhub.xpernex.com');
  }
  return `${cleanBase}${cleanUrl}`;
}
