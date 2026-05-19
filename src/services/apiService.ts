
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { Автомобиль } from '../types';

const getBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://127.0.0.1:3000/api/v1';
    return '/api/v1';
  }
  return (import.meta as any).env?.VITE_API_URL ?? '/api/v1';
};

const getSocketURL = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://127.0.0.1:3000';
  }
  return window.location.origin;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lsauto_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lsauto_token');
    }
    return Promise.reject(error);
  }
);

// ─── SOCKET.IO ──────────────────────────────────────────────────────────────

let _socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  const token = localStorage.getItem('lsauto_token');
  if (!token) return null;
  if (_socket?.connected) return _socket;
  _socket = io(getSocketURL(), {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });
  return _socket;
};

export const disconnectSocket = () => {
  if (_socket) { _socket.disconnect(); _socket = null; }
};

// ─── MAPPERS ────────────────────────────────────────────────────────────────

export const mapApiCar = (row: any): Автомобиль => ({
  id: String(row.id),
  марка: row.brand,
  модель: row.model,
  год: row.year,
  цена: Number(row.price),
  страна: (row.origin as any) ?? 'Китай',
  коробка: row.transmission ?? 'Автомат',
  топливо: row.fuel ?? 'Бензин',
  пробег: row.mileage ?? 0,
  описание: row.description ?? '',
  город: row.city ?? '',
  поставщикId: String(row.user_id ?? 's1'),
  изображения: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : []),
  тренд: false,
  теги: [],
});

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

// ─── CAR SERVICE ────────────────────────────────────────────────────────────

export const carService = {
  getAll: async (params?: {
    page?: number; limit?: number; brand?: string; city?: string;
    minPrice?: number; maxPrice?: number; minYear?: number; maxYear?: number;
    transmission?: string; fuel?: string; origin?: string; search?: string; sort?: string;
  }): Promise<{ data: Автомобиль[]; pagination: Pagination }> => {
    const response = await api.get('/cars', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data.map(mapApiCar), pagination: { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 } };
    }
    return { data: response.data.data.map(mapApiCar), pagination: response.data.pagination };
  },

  create: async (car: Partial<Автомобиль>) => {
    const payload = {
      brand: car.марка, model: car.модель, year: car.год, price: car.цена,
      origin: car.страна, transmission: car.коробка, fuel: car.топливо,
      mileage: car.пробег, city: car.город, description: car.описание,
      images: car.изображения ?? [],
    };
    const response = await api.post('/cars', payload);
    return mapApiCar(response.data);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url as string;
  },

  uploadVideo: async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    });
    return response.data.url as string;
  },
};

// ─── AUTH SERVICE ───────────────────────────────────────────────────────────

export const authService = {
  register: async (userData: { name: string; email: string; password: string; role: string }) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) localStorage.setItem('lsauto_token', response.data.token);
    return response.data as { success: boolean; token: string; user: { id: number; email: string; role: string; name: string; level: number; is_verified: boolean } };
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) localStorage.setItem('lsauto_token', response.data.token);
    return response.data as { success: boolean; token: string; user: { id: number; email: string; role: string; name: string; level: number; is_verified: boolean } };
  },

  logout: async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('lsauto_token');
    disconnectSocket();
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  uploadKyc: async (file: File, docType = 'passport') => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);
    const response = await api.post('/upload/kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { url: string; status: string };
  },
};

// ─── REQUEST SERVICE ────────────────────────────────────────────────────────

export const requestService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/requests', { params });
    if (Array.isArray(response.data)) return { data: response.data, pagination: null };
    return response.data as { data: any[]; pagination: Pagination };
  },
  create: async (data: { brand: string; model: string; budget: number; year?: string; city?: string; comment?: string }) => {
    const response = await api.post('/requests', data);
    return response.data;
  },
};

// ─── FAVORITE SERVICE ───────────────────────────────────────────────────────

export const favoriteService = {
  getAll: async (): Promise<string[]> => {
    const response = await api.get('/favorites');
    return response.data as string[];
  },
  add: async (carId: string) => { await api.post('/favorites', { carId }); },
  remove: async (carId: string) => { await api.delete(`/favorites/${carId}`); },
};

// ─── DEAL SERVICE ───────────────────────────────────────────────────────────

export const dealService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/deals', { params });
    if (Array.isArray(response.data)) return { data: response.data, pagination: null };
    return response.data as { data: any[]; pagination: Pagination };
  },
  create: async (carName: string, escrowAmount?: number) => {
    const response = await api.post('/deals', { carName, escrowAmount: escrowAmount || 0 });
    return response.data;
  },
  updateEscrow: async (dealId: string, escrowStatus: 'none' | 'held' | 'released' | 'refunded') => {
    const response = await api.patch(`/deals/${dealId}/escrow`, { escrowStatus });
    return response.data;
  },
};

// ─── POST SERVICE ───────────────────────────────────────────────────────────

export const postService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/posts', { params });
    if (Array.isArray(response.data)) return { data: response.data, pagination: null };
    return response.data as { data: any[]; pagination: Pagination };
  },
  create: async (post: { supplierName?: string; type?: string; title: string; text: string; image?: string }) => {
    const response = await api.post('/posts', post);
    return response.data;
  },
  like: async (id: number) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data as { likes: number };
  },
};

// ─── VLOG SERVICE ───────────────────────────────────────────────────────────

export const vlogService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/vlogs', { params });
    if (Array.isArray(response.data)) return { data: response.data, pagination: null };
    return response.data as { data: any[]; pagination: Pagination };
  },
  create: async (vlog: { supplierName?: string; title: string; description?: string; video_url: string; thumbnail?: string }) => {
    const response = await api.post('/vlogs', vlog);
    return response.data;
  },
  view: async (id: number) => { await api.post(`/vlogs/${id}/view`).catch(() => {}); },
};

// ─── CHAT SERVICE ───────────────────────────────────────────────────────────

export const chatService = {
  getHistory: async (roomId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/chat/${roomId}`, { params });
    return response.data as { data: any[]; pagination: Pagination };
  },
};

// ─── CUSTOMS SERVICE ────────────────────────────────────────────────────────

export const customsService = {
  calculate: async (params: {
    carPrice: number; origin: string; enginePower: number; isFirstCar?: boolean;
  }) => {
    const response = await api.post('/customs/calculate', params);
    return response.data as {
      carPrice: number; duty: number; excise: number;
      recyclingFee: number; vat: number; total: number; totalWithCar: number;
    };
  },
};

// ─── SUPPLIER SERVICE ───────────────────────────────────────────────────────

export const supplierService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/suppliers', { params });
    if (Array.isArray(response.data)) return { data: response.data, pagination: null };
    return response.data as { data: any[]; pagination: Pagination };
  },
  verify: async (id: number, is_verified: boolean) => {
    await api.patch(`/suppliers/${id}/verify`, { is_verified });
  },
};

// ─── FRAUD SERVICE ──────────────────────────────────────────────────────────

export const fraudService = {
  getEvents: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/fraud/events', { params });
    return response.data as { data: any[]; pagination: Pagination };
  },
  report: async (targetUserId: number, reason: string) => {
    await api.post('/fraud/report', { targetUserId, reason });
  },
};

export default api;
