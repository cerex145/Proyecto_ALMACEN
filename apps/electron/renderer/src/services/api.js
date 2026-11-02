import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');
export const SESSION_EXPIRED_EVENT = 'almacen:session-expired';

export function expireSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

const api = axios.create({ baseURL: `${API_ORIGIN}/api`,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 60000),
    headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && !String(error.config?.url || '').endsWith('/usuarios/login')) expireSession();
    return Promise.reject(error);
});

export async function openApiDocument(url) {
    const target = new URL(url, API_ORIGIN);
    if (target.origin !== new URL(API_ORIGIN).origin || !target.pathname.startsWith('/api/')) throw new Error('URL de documento no permitida');
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    try {
        const response = await api.get(target.href, { responseType: 'blob', timeout: 120000 });
        const blob = response.data;
        const objectUrl = URL.createObjectURL(blob);
        if (popup) popup.location.href = objectUrl;
        else {
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = response.headers['content-disposition']?.match(/filename="?([^";]+)/)?.[1] || 'documento';
            document.body.appendChild(link); link.click(); link.remove();
        }
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        return true;
    } catch (error) {
        if (popup) popup.close();
        throw error;
    }
}

export default api;
