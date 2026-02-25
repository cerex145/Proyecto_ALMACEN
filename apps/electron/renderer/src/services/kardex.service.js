import api from './api';

export const kardexService = {
    // Listar movimientos de kardex (general)
    listar: async (filtros = {}) => {
        const response = await api.get('/kardex', { params: filtros });
        return response.data;
    },

    // Obtener movimientos recientes (alias para listar con limit)
    getRecentMovements: async (limit = 5) => {
        const response = await api.get(`/kardex?limit=${limit}`);
        return response.data.data || response.data;
    },

    // Historial de un producto
    historialProducto: async (productoId) => {
        const response = await api.get(`/kardex/producto/${productoId}`);
        return response.data;
    },

    // Exportar a Excel
    exportar: async (filtros = {}) => {
        const response = await api.get('/kardex/exportar', {
            params: filtros,
            responseType: 'blob'
        });
        return response.data;
    },

    // Obtener alertas de vencimiento (delegado a endpoint de alertas si necesario, 
    // pero idealmente debería estar en alertasService. Lo mantenemos por compatibilidad si se usa)
    getAlerts: async () => {
        const response = await api.get('/alertas/vencimiento');
        return response.data.data || [];
    }
};
