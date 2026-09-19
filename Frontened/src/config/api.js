// Dynamic API Base URL for local development and live cloud deployments (Vercel)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '' // Avoid mixed-content blocking when frontend is live on HTTPS Vercel
    : 'http://localhost:3000');
