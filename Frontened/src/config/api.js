// Dynamic API Base URL for local development and live cloud deployments (Vercel)
const envApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export const API_BASE_URL = (() => {
  // If running in browser on HTTPS (such as Vercel live deployment), always use HTTPS origin / Vercel link
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (envApiUrl && !envApiUrl.includes('localhost')) {
      return envApiUrl;
    }
    return window.location.origin || 'https://mini-e-commerce-store-two.vercel.app';
  }

  // If environment variable is explicitly provided, use it
  if (envApiUrl) {
    return envApiUrl;
  }

  // Default fallback to Vercel live backend URL
  return 'https://mini-e-commerce-store-two.vercel.app';
})();

