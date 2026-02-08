import api from './api';

export const lotesService = {
    // Listar lotes
    listar: async (filtros = {}) => {
        const response = await api.get('/lotes', { params: filtros });
        return response.data;
    },

    // Obtener lote por ID
    obtener: async (id) => {
        const response = await api.get(`/lotes/${id}`);
        return response.data;
    },

    // Crear lote
    crear: async (data) => {
        const response = await api.post('/lotes', data);
        return response.data;
    },

    // Actualizar lote
    actualizar: async (id, data) => {
        const response = await api.put(`/lotes/${id}`, data);
        return response.data;
    },

    // Eliminar lote (lógico)
    eliminar: async (id) => {
        const response = await api.delete(`/lotes/${id}`);
        return response.data;
    },

    // Lotes de un producto
    porProducto: async (productoId) => {
        const response = await api.get(`/lotes/producto/${productoId}`);
        return response.data;
    }
};
