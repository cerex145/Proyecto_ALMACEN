import api from './api';

export const salidasService = {
    // Listar notas de salida
    listar: async (filtros = {}) => {
        const response = await api.get('/salidas', { params: filtros });
        return response.data;
    },

    // Obtener detalles de salida
    obtener: async (id) => {
        const response = await api.get(`/salidas/${id}`);
        return response.data;
    },

    // Crear nota de salida
    crear: async (data) => {
        const response = await api.post('/salidas', data);
        return response.data;
    },

    // Actualizar nota de salida
    actualizar: async (id, data) => {
        const response = await api.put(`/salidas/${id}`, data);
        return response.data;
    },

    // Despachar salida
    despachar: async (id) => {
        const response = await api.post(`/salidas/${id}/despachar`);
        return response.data;
    },

    // Importar desde Excel
    importar: async (archivo) => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        const response = await api.post('/salidas/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Exportar a Excel
    exportar: async () => {
        const response = await api.get('/salidas/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }
};
