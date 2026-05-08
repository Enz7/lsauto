
import axios from 'axios';

// Используем 127.0.0.1 вместо localhost для обхода проблем с IPv6 в Windows
const API_URL = 'http://127.0.0.1:3000/api/v1';

console.log('API Service initialized with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lsauto_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const carService = {
  getAll: async () => {
    const response = await api.get('/cars');
    return response.data;
  },
  create: async (car: any) => {
    const response = await api.post('/cars', car);
    return response.data;
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

export const authService = {
  register: async (userData: any) => {
    console.log('AXIOS: Отправка запроса на регистрацию...', userData);
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('lsauto_token', response.data.token);
    }
    return response.data;
  }
};

export default api;
