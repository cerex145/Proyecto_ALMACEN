import api from './api';

export const actasService = {
    // Listar actas de recepción
    listar: async (filtros = {}) => {
        const response = await api.get('/actas-recepcion', { params: filtros });
        return response.data;
    },

    // Obtener detalles de acta
    obtener: async (id) => {
        const response = await api.get(`/actas-recepcion/${id}`);
        return response.data;
    },

    // Crear acta de recepción
    crear: async (data) => {
        const response = await api.post('/actas-recepcion', data);
        return response.data;
    },

    // Actualizar acta
    actualizar: async (id, data) => {
        const response = await api.put(`/actas-recepcion/${id}`, data);
        return response.data;
    },

    // Aprobar acta
    aprobar: async (id) => {
        const response = await api.post(`/actas-recepcion/${id}/aprobar`);
        return response.data;
    },

    // Importar desde Excel
    importar: async (archivo) => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        const response = await api.post('/actas-recepcion/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Exportar a Excel
    exportar: async () => {
        const response = await api.get('/actas-recepcion/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }
};
