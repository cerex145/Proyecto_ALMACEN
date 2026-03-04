import api from './api';

export const productService = {
    // Productos
    getProducts: async (filters = {}) => {
        const response = await api.get('/productos', { params: filters });
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

    importProducts: async (file, numeroDocumento) => {
        const formData = new FormData();
        formData.append('file', file);
        if (numeroDocumento) {
            formData.append('numero_documento', numeroDocumento);
        }
        const response = await api.post('/productos/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    createProductsLote: async (data) => {
        // data.numero_documento string, data.productos array
        const response = await api.post('/productos/lote', data);
        return response.data;
    },

    exportProducts: async () => {
        const response = await api.get('/productos/exportar', {
            responseType: 'blob'
        });
        return response.data;
    },

    // Inventario General
    getInventario: async (filters = {}) => {
        const response = await api.get('/productos/inventario', { params: filters });
        return response.data.data || [];
    },

    // Lotes
    getLotesByProduct: async (productId) => {
        const response = await api.get(`/lotes/producto/${productId}`);
        return response.data.data || [];
    },

    getLotes: async (filters = {}) => {
        const response = await api.get('/lotes', { params: filters });
        return response.data.data || [];
    }
};
