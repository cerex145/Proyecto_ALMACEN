import api from './api';

export const ajustesService = {
    // Listar ajustes
    listar: async (filtros = {}) => {
        const response = await api.get('/ajustes', { params: filtros });
        return response.data;
    },

    // Obtener ajuste por ID
    obtener: async (id) => {
        const response = await api.get(`/ajustes/${id}`);
        return response.data;
    },

    // Crear ajuste
    crear: async (data) => {
        const response = await api.post('/ajustes', data);
        return response.data;
    },

    // Reporte: Ajustes por producto
    reportePorProducto: async (filtros = {}) => {
        const response = await api.get('/ajustes/reportes/por-producto', { params: filtros });
        return response.data;
    },

    // Reporte: Ajustes por tipo
    reportePorTipo: async (filtros = {}) => {
        const response = await api.get('/ajustes/reportes/por-tipo', { params: filtros });
        return response.data;
    }
};
