import api from './api';

export const reportesService = {
    // Stock actual
    stockActual: async (filtros = {}) => {
        const response = await api.get('/reportes/stock-actual', { params: filtros });
        return response.data;
    },

    // Ingresos por período
    ingresos: async (filtros = {}) => {
        const response = await api.get('/reportes/ingresos', { params: filtros });
        return response.data;
    },

    // Salidas por período
    salidas: async (filtros = {}) => {
        const response = await api.get('/reportes/salidas', { params: filtros });
        return response.data;
    },

    // Productos por categoría
    productosPorCategoria: async () => {
        const response = await api.get('/reportes/productos-por-categoria');
        return response.data;
    },

    // Exportar todos los reportes
    exportar: async () => {
        const response = await api.get('/reportes/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }
};
