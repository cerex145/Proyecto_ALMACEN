import { createContext, useContext, useState, useEffect } from 'react';
import { authService, sessionExpiresAt } from '../services/auth.service';
import { SESSION_EXPIRED_EVENT } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        const onExpired = () => { if (active) setUser(null); };
        window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
        const token = localStorage.getItem('token');
        if (!authService.getCurrentUser()) setLoading(false);
        else authService.restoreSession().then(usuario => {
            if (active && token === localStorage.getItem('token')) setUser(usuario);
        }).catch(() => { authService.logout(); if (active) setUser(null); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired); };
    }, []);
    useEffect(() => {
        if (!user) return;
        const timer = window.setTimeout(() => { authService.logout(); setUser(null); }, Math.max(0, sessionExpiresAt() - Date.now()));
        return () => window.clearTimeout(timer);
    }, [user]);
    const login = async (username, password) => {
        const data = await authService.login(username, password);
        if (data.success) setUser(data.usuario);
        return data;
    };
    const logout = () => { authService.logout(); setUser(null); };
    const isAdmin = ['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'].includes(String(user?.rol || '').toUpperCase());
    return <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin, loading }}>
        {!loading && children}
    </AuthContext.Provider>;
};
