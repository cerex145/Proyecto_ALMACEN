import api from './api';

export const ingresosService = {
    // Listar notas de ingreso
    listar: async (filtros = {}) => {
        const response = await api.get('/ingresos', { params: filtros });
        return response.data;
    },

    // Obtener detalles de nota de ingreso
    obtener: async (id) => {
        const response = await api.get(`/ingresos/${id}`);
        return response.data;
    },

    // Crear nota de ingreso
    crear: async (data) => {
        const response = await api.post('/ingresos', data);
        return response.data;
    },

    // Actualizar nota de ingreso
    actualizar: async (id, data) => {
        const response = await api.put(`/ingresos/${id}`, data);
        return response.data;
    },

    // Aprobar nota de ingreso
    aprobar: async (id) => {
        const response = await api.post(`/ingresos/${id}/aprobar`);
        return response.data;
    },

    // Importar desde Excel
    importar: async (archivo) => {
        const formData = new FormData();
        formData.append('archivo', archivo);
        const response = await api.post('/ingresos/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Exportar a Excel
    exportar: async () => {
        const response = await api.get('/ingresos/exportar', {
            responseType: 'blob'
        });
        return response.data;
    },

    // Descargar plantilla
    descargarPlantilla: async () => {
        const response = await api.get('/ingresos/plantilla/descargar', {
            responseType: 'blob'
        });
        return response.data;
    }
};
