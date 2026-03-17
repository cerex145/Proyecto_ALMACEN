import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 60000);

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`,
    timeout: API_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;