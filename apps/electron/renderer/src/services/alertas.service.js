import api from './api';

export const kardexService = {
    // Listar movimientos de kardex
    listar: async (filtros = {}) => {
        const response = await api.get('/kardex', { params: filtros });
        return response.data;
    },

    // Historial de un producto
    historialProducto: async (productoId) => {
        const response = await api.get(`/kardex/producto/${productoId}`);
        return response.data;
    },

    // Exportar a Excel
    exportar: async () => {
        const response = await api.get('/kardex/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }
};
