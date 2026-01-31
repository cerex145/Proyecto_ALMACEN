import api from './api';

export const kardexService = {
    // Get latest movements (global)
    getRecentMovements: async (limit = 5) => {
        // Mocking backend response structure for now
        // In real backend: SELECT * FROM kardex ORDER BY id DESC LIMIT 5
        const response = await api.get(`/kardex?limit=${limit}`);
        return response.data.data || [];
    },

    // Get alerts (v_productos_por_vencer)
    getAlerts: async () => {
        // Should return data matching v_productos_por_vencer view
        const response = await api.get('/alertas/vencimiento');
        return response.data.data || [];
    }
};
