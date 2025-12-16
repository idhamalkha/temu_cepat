import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with CORS support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service for Laporan (Reports)
export const laporanAPI = {
  // Create new laporan
  async create(data) {
    try {
      const response = await apiClient.post('/laporan', data);
      // Save token to localStorage. The server sets an HttpOnly cookie
      // (persistent) so the browser will send it automatically on future
      // requests. We still keep a copy in localStorage as a fallback.
      if (response.data.token_cookie) {
        localStorage.setItem('laporan_token', response.data.token_cookie);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's own laporan (requires cookie)
  async getMyLaporan() {
    try {
      // Let the browser send the cookie automatically (axios `withCredentials: true`)
      const response = await apiClient.get('/laporan/mine');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all laporan (admin view) with optional filters
  async getAll(status = null, limit = 100, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (filters.id_kategori) params.append('id_kategori', filters.id_kategori);
      if (filters.id_provinsi) params.append('id_provinsi', filters.id_provinsi);
      if (filters.id_kota) params.append('id_kota', filters.id_kota);
      params.append('limit', limit);
      
      const response = await apiClient.get(`/laporan?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark laporan as found
  async markFound(id) {
    try {
      const token = localStorage.getItem('laporan_token');
      const response = await apiClient.patch(`/laporan/${id}/found`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete laporan (admin)
  async delete(id, admin = true) {
    try {
      const response = await apiClient.delete(`/laporan/${id}`, {
        params: { admin }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// API Service for Notifikasi (Notifications)
export const notifikasiAPI = {
  // Get all notifications
  async getAll(unreathOnly = false) {
    try {
      const response = await apiClient.get('/notifikasi', {
        params: { unread_only: unreathOnly }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  async markRead(id) {
    try {
      const response = await apiClient.patch(`/notifikasi/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Helper function to get token from cookie
export function getTokenFromCookie() {
  const name = 'laporan_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

// Helper function to save token to both localStorage and cookie
export function saveToken(token) {
  // Keep localStorage copy for fallback; do NOT write a non-HttpOnly cookie
  // here to avoid conflicting with the server-set cookie.
  localStorage.setItem('laporan_token', token);
}

// Helper function to clear token
export function clearToken() {
  localStorage.removeItem('laporan_token');
  // We attempt to clear the cookie client-side as well; server HttpOnly
  // cookie cannot be cleared from JS, so the server should provide an
  // endpoint to remove it if needed. Keep the client-side expired cookie
  // removal for non-HttpOnly cases.
  document.cookie = 'laporan_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Logout (server clears HttpOnly cookie)
export async function logout() {
  try {
    const resp = await apiClient.post('/laporan/logout');
    // clear local fallback token as well
    clearToken();
    return resp.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

// Cookie fallback opt-in: restore a non-HttpOnly cookie from localStorage when enabled.
export function enableCookieFallback() {
  localStorage.setItem('cookie_fallback_enabled', 'true');
}

export function disableCookieFallback() {
  localStorage.removeItem('cookie_fallback_enabled');
}

export function isCookieFallbackEnabled() {
  return localStorage.getItem('cookie_fallback_enabled') === 'true';
}

export function maybeRestoreCookieFromLocalStorage() {
  try {
    if (!isCookieFallbackEnabled()) return false;
    // if cookie already present, nothing to do
    const name = 'laporan_token=';
    if (document.cookie.split(';').some(c => c.trim().startsWith(name))) return true;
    const token = localStorage.getItem('laporan_token');
    if (token) {
      // create a persistent non-HttpOnly cookie (explicit opt-in)
      const maxAge = 60 * 60 * 24 * 30; // 30 days
      document.cookie = `laporan_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      return true;
    }
  } catch (e) {
    console.warn('cookie fallback restore failed', e);
  }
  return false;
}

export default apiClient;
