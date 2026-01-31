import api from './api';

export const usuariosService = {
    // Registro de usuario
    registrar: async (data) => {
        const response = await api.post('/usuarios/registro', data);
        return response.data;
    },

    // Login
    login: async (usuario, password) => {
        const response = await api.post('/usuarios/login', { usuario, password });
        return response.data;
    },

    // Listar usuarios
    listar: async (filtros = {}) => {
        const response = await api.get('/usuarios', { params: filtros });
        return response.data;
    },

    // Obtener usuario
    obtener: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // Actualizar usuario
    actualizar: async (id, data) => {
        const response = await api.put(`/usuarios/${id}`, data);
        return response.data;
    },

    // Cambiar contraseña
    cambiarPassword: async (id, data) => {
        const response = await api.post(`/usuarios/${id}/cambiar-password`, data);
        return response.data;
    },

    // Deactivar usuario
    deactivar: async (id) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },

    // Listar roles
    listarRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },

    // Crear rol
    crearRol: async (data) => {
        const response = await api.post('/roles', data);
        return response.data;
    },

    // Listar auditoría
    listarAuditoria: async (filtros = {}) => {
        const response = await api.get('/auditorias', { params: filtros });
        return response.data;
    }
};
