
import axios from 'axios';
import { Автомобиль, Поставщик, Заявка } from '../types';

// URL вашего будущего бэкенда
// @ts-ignore
const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lsauto_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const carService = {
  getAll: async () => {
    const response = await api.get<Автомобиль[]>('/cars');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Автомобиль>(`/cars/${id}`);
    return response.data;
  },
  create: async (car: Partial<Автомобиль>) => {
    const response = await api.post<Автомобиль>('/cars', car);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/cars/${id}`);
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  }
};

export const supplierService = {
  getAll: async () => {
    const response = await api.get<Поставщик[]>('/suppliers');
    return response.data;
  },
  getProfile: async (id: string) => {
    const response = await api.get<Поставщик>(`/suppliers/${id}`);
    return response.data;
  },
  verify: async (data: any) => {
    const response = await api.post('/suppliers/verify', data);
    return response.data;
  }
};

export const requestService = {
  create: async (request: Partial<Заявка>) => {
    const response = await api.post<Заявка>('/requests', request);
    return response.data;
  },
  getGlobalFeed: async () => {
    const response = await api.get<Заявка[]>('/requests/feed');
    return response.data;
  }
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('lsauto_token', response.data.token);
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export default api;
