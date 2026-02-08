import api from './api';

export const productService = {
    // Productos
    getProducts: async () => {
        const response = await api.get('/productos');
        return response.data.data || [];
    },

    getProductById: async (id) => {
        const response = await api.get(`/productos/${id}`);
        return response.data.data || response.data;
    },

    createProduct: async (data) => {
        const response = await api.post('/productos', data);
        return response.data.data || response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/productos/${id}`, data);
        return response.data.data || response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/productos/${id}`);
        return response.data;
    },

    importProducts: async (file) => {
        const formData = new FormData();
        formData.append('archivo', file);
        const response = await api.post('/productos/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    exportProducts: async () => {
        const response = await api.get('/productos/exportar', {
            responseType: 'blob'
        });
        return response.data;
    },

    // Lotes
    getLotesByProduct: async (productId) => {
        const response = await api.get(`/lotes/producto/${productId}`);
        return response.data.data || [];
    }
};
