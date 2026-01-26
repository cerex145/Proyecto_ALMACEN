import api from './api';

export const productService = {
    // Productos
    getProducts: async () => {
        const response = await api.get('/productos');
        return response.data;
    },

    getProductById: async (id) => {
        const response = await api.get(`/productos/${id}`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post('/productos', data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/productos/${id}`, data);
        return response.data;
    },

    // Lotes
    getLotesByProduct: async (productId) => {
        const response = await api.get(`/productos/${productId}/lotes`);
        return response.data;
    }
};
