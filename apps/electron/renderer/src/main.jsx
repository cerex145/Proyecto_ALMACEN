import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/main.css';
import App from './App.jsx';
import { API_ORIGIN, expireSession } from './services/api';

const originalFetch = window.fetch.bind(window);
const localApi = /^https?:\/\/(localhost|127\.0\.0\.1):3000(\/api\/.+)$/i;
window.fetch = async (input, init = {}) => {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const match = rawUrl.match(localApi);
    const rewritten = match ? `${API_ORIGIN}${match[2]}` : rawUrl;
    const url = new URL(rewritten, window.location.href);
    const isApi = url.origin === new URL(API_ORIGIN).origin && url.pathname.startsWith('/api/');
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    const token = localStorage.getItem('token');
    if (isApi && token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    const request = input instanceof Request ? (match ? new Request(rewritten, input) : input) : rewritten;
    const response = await originalFetch(request, { ...init, headers });
    if (isApi && response.status === 401 && url.pathname !== '/api/usuarios/login') expireSession();
    return response;
};

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
