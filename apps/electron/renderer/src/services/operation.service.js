import api from './api';

export const operationService = {
    // Ingresos (Notas de Ingreso)
    createIngreso: async (data) => {
        // data: { proveedor_id, responsable_id, observaciones, detalles: [{ producto_id, cantidad }] }
        const response = await api.post('/ingresos', data);
        return response.data.data || response.data;
    },

    getIngresos: async () => {
        const response = await api.get('/ingresos');
        return response.data.data || [];
    },

    getIngresoById: async (id) => {
        const response = await api.get(`/ingresos/${id}`);
        return response.data.data || response.data;
    },

    // Actas de Recepción
    createActaRecepcion: async (data) => {
        // data: { ingreso_id, fecha_recepcion, responsable_recepcion_id, detalles: [{ producto_id, lote_numero, fecha_vencimiento, cantidad_recibida }] }
        const response = await api.post('/actas-recepcion', data);
        return response.data.data || response.data;
    },

    // Salidas
    createSalida: async (data) => {
        const response = await api.post('/salidas', data);
        return response.data.data || response.data;
    }
};
