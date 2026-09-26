// Dynamic API Base URL for local development and live cloud deployments (Vercel)
const envApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export const API_BASE_URL = 
  envApiUrl || 
  (typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? window.location.origin // Uses current HTTPS origin on Vercel
    : 'http://localhost:3000');

