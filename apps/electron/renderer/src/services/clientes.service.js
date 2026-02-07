import api from './api';

export const clienteService = {
    // Listar clientes
    getClientes: async () => {
        try {
            const response = await api.get('/clientes');
            return response.data;
        } catch (error) {
            console.error('Error fetching clientes:', error);
            throw error;
        }
    },

    // Obtener cliente por ID
    getClienteById: async (id) => {
        try {
            const response = await api.get(`/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cliente:', error);
            throw error;
        }
    },

    // Crear cliente
    createCliente: async (data) => {
        try {
            const response = await api.post('/clientes', data);
            return response.data;
        } catch (error) {
            console.error('Error creating cliente:', error);
            throw error;
        }
    },

    // Actualizar cliente
    updateCliente: async (id, data) => {
        try {
            const response = await api.put(`/clientes/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating cliente:', error);
            throw error;
        }
    },

    // Eliminar cliente
    deleteCliente: async (id) => {
        try {
            const response = await api.delete(`/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting cliente:', error);
            throw error;
        }
    }
};
