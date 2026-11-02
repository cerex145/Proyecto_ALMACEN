import api from './api';

const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); };

export function sessionExpiresAt() {
    try {
        const raw = (localStorage.getItem('token') || '').split('.')[1];
        const base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
        return Number.isFinite(decoded.exp) ? decoded.exp * 1000 : 0;
    } catch { return 0; }
}

const getCurrentUser = () => {
    try {
        if (sessionExpiresAt() <= Date.now()) { logout(); return null; }
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch { logout(); return null; }
};

const login = async (usuario, password) => {
    try {
        const { data } = await api.post('/usuarios/login', { usuario, password });
        if (data.success) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.usuario)); }
        return data;
    } catch (error) { throw new Error(error.response?.data?.error || 'Error al iniciar sesión'); }
};

const restoreSession = async () => {
    const { data } = await api.get('/usuarios/me');
    localStorage.setItem('user', JSON.stringify(data.usuario));
    return data.usuario;
};

export const authService = { login, logout, getCurrentUser, restoreSession,
    getUsers: async () => (await api.get('/usuarios')).data.data,
    createUser: async data => (await api.post('/usuarios/registro', data)).data,
    deleteUser: async id => (await api.delete(`/usuarios/${id}`)).data
};
