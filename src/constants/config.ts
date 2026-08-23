const getRawApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }
    if (window.location.protocol === 'https:') {
      return '/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://storyhub.xpernex.com/api';
};

const rawUrl = getRawApiUrl();

// API_BASE_URL without trailing /api or / for clean concatenation in website (e.g. `${API_BASE_URL}/api/...`)
export const API_BASE_URL = rawUrl.startsWith('/')
  ? ''
  : rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://storyhub.xpernex.com');

export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : 'https://consolestoryhub.xpernex.com');

// Safaricom SDP / Subscription Config
export const DSDP_CONSENT_URL = process.env.NEXT_PUBLIC_DSDP_CONSENT_URL || 'https://dsdp-cg.safaricom.com/consent-gateway';
export const OFFER_CODE = process.env.NEXT_PUBLIC_OFFER_CODE || '001023834317';
export const CP_ID = process.env.NEXT_PUBLIC_CP_ID || '238';
export const SUBSCRIPTION_PRICE = process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE || '15 KSH';
export const SUBSCRIPTION_AMOUNT = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_AMOUNT) || 15;


