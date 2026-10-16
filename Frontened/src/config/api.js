// Dynamic API Base URL for local development and live cloud deployments (Vercel)
const rawEnvUrl = (import.meta.env.VITE_API_URL || '').trim();

// The canonical live backend deployment on Vercel
export const BACKEND_LIVE_URL = 'https://mini-e-commerce-store-xqv2.vercel.app';

export const API_BASE_URL = (() => {
  // Clean up any trailing slashes or accidental '/api' suffix
  let cleanEnvUrl = rawEnvUrl.replace(/\/+$/, '');
  if (cleanEnvUrl.endsWith('/api')) {
    cleanEnvUrl = cleanEnvUrl.slice(0, -4).replace(/\/+$/, '');
  }

  // 1. Local development on http://localhost or http://127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return cleanEnvUrl || 'http://localhost:3000';
  }

  // 2. If an explicit environment variable is set and not pointing to the frontend static site itself
  if (cleanEnvUrl && !cleanEnvUrl.includes('mini-e-commerce-store-two')) {
    return cleanEnvUrl;
  }

  // 3. Fallback to the live backend serverless API on Vercel
  return BACKEND_LIVE_URL;
})();

// Helper to format product image URLs (replaces local uploads with backend host on cloud)
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:3000')) {
    return url.replace('http://localhost:3000', BACKEND_LIVE_URL);
  }
  return url;
};

