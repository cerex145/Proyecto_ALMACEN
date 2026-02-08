import api from './api';

export const clientesService = {
    // Listar clientes
    listar: async (filtros = {}) => {
        const response = await api.get('/clientes', { params: filtros });
        return response.data;
    },

    // Obtener cliente por ID
    obtener: async (id) => {
        const response = await api.get(`/clientes/${id}`);
        return response.data;
    },

    // Crear cliente
    crear: async (data) => {
        const response = await api.post('/clientes', data);
        return response.data;
    },

    // Actualizar cliente
    actualizar: async (id, data) => {
        const response = await api.put(`/clientes/${id}`, data);
        return response.data;
    },

    // Eliminar cliente (desactivar)
    eliminar: async (id) => {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    },

    // Importar clientes desde Excel
    importar: async (archivo) => {
        const formData = new FormData();
        formData.append('file', archivo);
        const response = await api.post('/clientes/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Exportar clientes a Excel
    exportar: async (filtros = {}) => {
        const response = await api.get('/clientes/exportar', {
            params: filtros,
            responseType: 'blob'
        });
        return response.data;
    }
};
