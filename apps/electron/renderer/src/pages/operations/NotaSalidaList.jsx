import React, { useState, useEffect } from 'react';
import { salidasService } from '../../services/salidas.service';
import { API_ORIGIN } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const NotaSalidaList = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({ cliente_id: '', estado: '', page: 1 });

    useEffect(() => {
        cargarSalidas();
    }, [filtros]);

    const cargarSalidas = async () => {
        try {
            setLoading(true);
            const response = await salidasService.listar(filtros);
            setSalidas(response.data || []);
        } catch (error) {
            console.error('Error al cargar salidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDespachar = async (id) => {
        try {
            await salidasService.despachar(id);
            cargarSalidas();
            alert('✅ Salida despachada exitosamente');
        } catch (error) {
            alert('❌ Error al despachar');
            console.error(error);
        }
    };

    const handleExportar = async () => {
        try {
            const url = `${API_ORIGIN}/api/salidas/exportar`;
            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('download-file', {
                    url,
                    filename: 'salidas.xlsx'
                });
            } else {
                const blob = await salidasService.exportar();
                const urlObj = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = urlObj;
                a.download = 'salidas.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(urlObj);
            }
            alert('✅ Salidas descargadas correctamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('❌ Error al descargar salidas');
        }
    };

    const getEstadoBadge = (estado) => {
        const colores = {
            'REGISTRADA': 'primary',
            'DESPACHADA': 'success',
            'ENTREGADA': 'success',
            'CANCELADA': 'danger'
        };
        return <Badge variant={colores[estado] || 'secondary'}>{estado}</Badge>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Notas de Salida</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos los estados</option>
                    <option value="REGISTRADA">Registrada</option>
                    <option value="DESPACHADA">Despachada</option>
                    <option value="ENTREGADA">Entregada</option>
                </select>
                <Button onClick={cargarSalidas}>Actualizar</Button>
                <Button onClick={handleExportar} variant="secondary">Exportar a Excel</Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Número Salida</TableHeader>
                            <TableHeader>Cliente</TableHeader>
                            <TableHeader>Fecha</TableHeader>
                            <TableHeader>Cantidad Productos</TableHeader>
                            <TableHeader>Monto Total</TableHeader>
                            <TableHeader>Estado</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salidas.length > 0 ? (
                            salidas.map((salida) => (
                                <TableRow key={salida.id}>
                                    <TableCell>{salida.numero_salida}</TableCell>
                                    <TableCell>{salida.cliente?.razon_social || salida.cliente_id}</TableCell>
                                    <TableCell>{new Date(salida.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{salida.detalles_count || 0}</TableCell>
                                    <TableCell>${(salida.monto_total || 0).toFixed(2)}</TableCell>
                                    <TableCell>{getEstadoBadge(salida.estado)}</TableCell>
                                    <TableCell>
                                        {salida.estado === 'REGISTRADA' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleDespachar(salida.id)}
                                            >
                                                Despachar
                                            </Button>
                                        )}
                                        {salida.estado === 'DESPACHADA' && (
                                            <Badge variant="primary">En tránsito</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="7" style={{ textAlign: 'center' }}>
                                    No hay notas de salida
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
