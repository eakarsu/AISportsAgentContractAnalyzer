import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getAll = (feature) => api.get(`/${feature}`);
export const getOne = (feature, id) => api.get(`/${feature}/${id}`);
export const create = (feature, data) => api.post(`/${feature}`, data);
export const update = (feature, id, data) => api.put(`/${feature}/${id}`, data);
export const remove = (feature, id) => api.delete(`/${feature}/${id}`);
export const aiAnalyze = (feature, data) =>
  api.post(`/${feature}/ai-analyze`, { data });

export default api;
