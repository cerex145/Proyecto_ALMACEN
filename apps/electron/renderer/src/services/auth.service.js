import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '');
const API_URL = `${API_ORIGIN}/api/usuarios`;

const login = async (usuario, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { usuario, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.usuario));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al iniciar sesión';
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const getUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data.data;
};

const createUser = async (userData) => {
    const response = await axios.post(`${API_URL}/registro`, userData);
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const authService = {
    login,
    logout,
    getCurrentUser,
    getUsers,
    createUser,
    deleteUser
};
