import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`,
    timeout: 10000,
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