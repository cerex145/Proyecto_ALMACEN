import api from './api';

export const alertasService = {
    // Listar alertas de vencimiento
    listar: async (filtros = {}) => {
        const params = Object.fromEntries(
            Object.entries(filtros).filter(([, value]) => value !== '' && value !== undefined && value !== null)
        );
        const response = await api.get('/alertas/vencimiento', { params });
        return response.data;
    },

    // Obtener resumen de alertas
    resumen: async () => {
        const response = await api.get('/alertas/resumen');
        return response.data;
    },

    // Marcar alerta como leída
    marcarLeida: async (id) => {
        const response = await api.put(`/alertas/${id}/marcar-leida`);
        return response.data;
    },

    // Marcar todas como leídas
    marcarTodasLeidas: async () => {
        const response = await api.post('/alertas/marcar-todos-leidos');
        return response.data;
    },

    // Eliminar alerta
    eliminar: async (id) => {
        const response = await api.delete(`/alertas/${id}`);
        return response.data;
    },

    // Lotes próximos a vencer
    proximosAVencer: async () => {
        const response = await api.get('/lotes/proximos-a-vencer');
        return response.data;
    },

    // Lotes vencidos
    vencidos: async () => {
        const response = await api.get('/lotes/vencidos');
        return response.data;
    }
};
