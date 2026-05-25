import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { Car, Supplier, Pagination } from '@/types';

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lsauto_auth');
      localStorage.removeItem('lsauto_role');
      localStorage.removeItem('lsauto_current_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── SOCKET.IO ──────────────────────────────────────────────────────────────

let _socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (_socket?.connected) return _socket;
  _socket = io(getSocketURL(), {
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

export const mapApiCar = (row: any): Car => ({
  id: String(row.id),
  brand: row.brand ?? '',
  model: row.model ?? '',
  year: row.year ?? 0,
  price: Number(row.price),
  origin: (row.origin as Car['origin']) ?? 'Китай',
  transmission: row.transmission ?? 'Автомат',
  fuel: row.fuel ?? 'Бензин',
  mileage: row.mileage ?? 0,
  description: row.description ?? '',
  city: row.city ?? '',
  supplierId: String(row.user_id ?? 's1'),
  images: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : []),
  isTrending: false,
  tags: [],
  status: (row.status as Car['status']) ?? 'pending',
});

export const mapApiSupplier = (row: any): Supplier => ({
  id: String(row.id),
  name: row.name ?? '',
  city: row.city ?? '',
  contacts: row.phone ?? '',
  description: row.description ?? '',
  experience: row.experience ?? '0 лет',
  docsStatus: row.is_verified ? 'проверен' : 'не проверен',
  photos: row.photo_url
    ? [row.photo_url]
    : ['https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800'],
  rating: Number(row.rating) || 5.0,
  level: Number(row.level) || 1,
  isVerified: Boolean(row.is_verified),
});

// ─── CAR SERVICE ────────────────────────────────────────────────────────────

export const carService = {
  getAll: async (params?: {
    page?: number; limit?: number; brand?: string; city?: string;
    minPrice?: number; maxPrice?: number; minYear?: number; maxYear?: number;
    transmission?: string; fuel?: string; origin?: string; search?: string; sort?: string;
  }): Promise<{ data: Car[]; pagination: Pagination }> => {
    const response = await api.get('/cars', { params });
    if (Array.isArray(response.data)) {
      return { data: response.data.map(mapApiCar), pagination: { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 } };
    }
    return { data: response.data.data.map(mapApiCar), pagination: response.data.pagination };
  },

  create: async (car: Partial<Car>) => {
    const payload = {
      brand: car.brand, model: car.model, year: car.year, price: car.price,
      origin: car.origin, transmission: car.transmission, fuel: car.fuel,
      mileage: car.mileage, city: car.city, description: car.description,
      images: car.images ?? [],
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

  getById: async (id: string): Promise<Car | null> => {
    try {
      const response = await api.get(`/cars/${id}`);
      return mapApiCar(response.data);
    } catch {
      return null;
    }
  },

  getMy: async (): Promise<{ data: Car[]; pagination: Pagination }> => {
    const response = await api.get('/cars/my');
    if (Array.isArray(response.data)) {
      return { data: response.data.map(mapApiCar), pagination: { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 } };
    }
    return { data: response.data.data.map(mapApiCar), pagination: response.data.pagination };
  },

  update: async (id: string, car: Partial<Car>): Promise<Car> => {
    const payload = {
      brand: car.brand, model: car.model, year: car.year, price: car.price,
      origin: car.origin, transmission: car.transmission, fuel: car.fuel,
      mileage: car.mileage, city: car.city, description: car.description,
      images: car.images ?? [],
    };
    const response = await api.put(`/cars/${id}`, payload);
    return mapApiCar(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cars/${id}`);
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
    return response.data as { success: boolean; user: { id: number; email: string; role: string; name: string; level: number; is_verified: boolean } };
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data as { success: boolean; user: { id: number; email: string; role: string; name: string; level: number; is_verified: boolean } };
  },

  logout: async () => {
    await api.post('/auth/logout').catch(() => {});
    disconnectSocket();
  },

  refresh: async () => {
    await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
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
  delete: async (id: number) => {
    await api.delete(`/posts/${id}`);
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
  getAll: async (params?: { page?: number; limit?: number }): Promise<{ data: Supplier[]; pagination: Pagination | null }> => {
    const response = await api.get('/suppliers', { params });
    const rows = Array.isArray(response.data) ? response.data : response.data.data;
    const pagination = Array.isArray(response.data) ? null : response.data.pagination;
    return { data: rows.map(mapApiSupplier), pagination };
  },
  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return mapApiSupplier(response.data);
  },
  getByCity: async (city: string, params?: { page?: number; limit?: number }): Promise<{ data: Supplier[]; pagination: Pagination | null }> => {
    const response = await api.get(`/suppliers/city/${encodeURIComponent(city)}`, { params });
    const rows = Array.isArray(response.data) ? response.data : response.data.data;
    const pagination = Array.isArray(response.data) ? null : response.data.pagination;
    return { data: rows.map(mapApiSupplier), pagination };
  },
  verify: async (id: number, is_verified: boolean) => {
    await api.patch(`/suppliers/${id}/verify`, { is_verified });
  },
};

// ─── PROFILE SERVICE ────────────────────────────────────────────────────────

export const profileService = {
  update: async (data: { name: string; email?: string; city?: string; description?: string; experience?: string; phone?: string; photo_url?: string }) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};

// ─── TRADE-IN SERVICE ───────────────────────────────────────────────────────

export const tradeInService = {
  create: async (data: { brand: string; model: string; year?: number; mileage?: number; condition?: string; owners?: number; estimateMin?: number; estimateMax?: number }) => {
    const response = await api.post('/trade-in', data);
    return response.data;
  },
};

// ─── ADMIN SERVICE ──────────────────────────────────────────────────────────

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data as { usersCount: number; pendingCars: number; dealsCount: number; activeChats: number; revenue: number };
  },
  getUsers: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/admin/users', { params });
    return response.data as { data: any[]; pagination: Pagination };
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
