import axios from 'axios';

// Falls back to localhost for local dev; set VITE_API_URL in your deployment
// platform's environment variables once the backend is actually deployed.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ASSET_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

// Images are now stored on Cloudinary as full URLs. This helper handles
// both that (new) case and any old local-path images already in the
// database from before the Cloudinary migration, without double-prefixing.
export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE_URL}${imageUrl}`;
}

export default api;
