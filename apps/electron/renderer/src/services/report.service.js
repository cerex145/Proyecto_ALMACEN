import axios from 'axios';

const API_URL = 'http://localhost:3000/api/reportes';

const getStockReport = async (incluirLotes = false) => {
    try {
        const response = await axios.get(`${API_URL}/stock-actual`, {
            params: { incluir_lotes: incluirLotes }
        });
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener reporte de stock';
    }
};

const getIngresosReport = async (filters) => {
    try {
        const response = await axios.get(`${API_URL}/ingresos`, { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener reporte de ingresos';
    }
};

const getSalidasReport = async (filters) => {
    try {
        const response = await axios.get(`${API_URL}/salidas`, { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener reporte de salidas';
    }
};

const getCategoriasReport = async () => {
    try {
        const response = await axios.get(`${API_URL}/productos-por-categoria`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener reporte por categorías';
    }
};

const downloadExcelExport = async () => {
    try {
        const response = await axios.get(`${API_URL}/exportar`, {
            responseType: 'blob'
        });

        // Crear link de descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Reporte_Almacen_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error(error);
        throw 'Error al descargar el archivo Excel';
    }
};

export const reportService = {
    getStockReport,
    getIngresosReport,
    getSalidasReport,
    getCategoriasReport,
    downloadExcelExport
};
