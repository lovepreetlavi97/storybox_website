export const API_BASE_URL = typeof window !== 'undefined'
  ? (window.location.protocol === 'https:' ? '' : 'http://3.82.47.4:5000')
  : (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://3.82.47.4:5000');

export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://storyhub.xpernex.com';
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://consolestoryhub.xpernex.com';
