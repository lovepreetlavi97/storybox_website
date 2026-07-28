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
  
  // If relative upload path, resolve to S3 bucket URL
  if (cleanUrl.startsWith('/uploads/')) {
    return `https://xpernex-storage.s3.us-east-1.amazonaws.com${cleanUrl}`;
  }

  const cleanBase = defaultBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${cleanBase}${cleanUrl}`;
}
