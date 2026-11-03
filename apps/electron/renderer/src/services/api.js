import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen-api.onrender.com').replace(/\/+$/, '');
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
    const pdf = target.pathname.endsWith('/pdf');
    const excel = target.pathname.endsWith('/exportar');
    try {
        const response = await api.get(target.href, { responseType: 'blob', timeout: 120000 });
        const blob = response.data;
        if (pdf && await blob.slice(0, 5).text() !== '%PDF-') {
            throw new Error('El servidor no devolvió un PDF válido.');
        }
        if (excel && await blob.slice(0, 4).text() !== 'PK\x03\x04') {
            throw new Error('El servidor no devolvió un archivo Excel válido.');
        }
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        const filename = response.headers['content-disposition']?.match(/filename="?([^";]+)/)?.[1];
        const [, , resource, id] = target.pathname.split('/');
        link.download = filename || (pdf ? resource + '-' + id + '.pdf' : excel ? resource + '.xlsx' : 'documento');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        return true;
    } catch (error) {
        const status = error.response?.status;
        if (status === 401) throw new Error('Su sesión venció. Vuelva a iniciar sesión.');
        if (status === 403) throw new Error('Su usuario no tiene permiso para descargar este documento.');
        if (status === 404) throw new Error('El documento solicitado no existe.');
        if (status >= 500 || !error.response && error.isAxiosError) {
            throw new Error('No se pudo descargar el documento. Reintente en unos momentos.');
        }
        throw error;
    }
}

export default api;
