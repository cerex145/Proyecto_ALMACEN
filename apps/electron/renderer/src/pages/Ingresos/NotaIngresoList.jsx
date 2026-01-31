import React, { useState, useEffect } from 'react';
import { ingresosService } from '../../services/ingresos.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const NotaIngresoList = () => {
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({ busqueda: '', estado: '' });
    const [paginacion, setPaginacion] = useState({ page: 1, limit: 10 });

    useEffect(() => {
        cargarIngresos();
    }, [paginacion, filtros]);

    const cargarIngresos = async () => {
        try {
            setLoading(true);
            const params = { ...filtros, ...paginacion };
            const response = await ingresosService.listar(params);
            setIngresos(response.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = async () => {
        try {
            const blob = await ingresosService.exportar();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ingresos.xlsx';
            a.click();
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    const getEstadoBadge = (estado) => {
        const colores = {
            'REGISTRADA': 'primary',
            'APROBADA': 'success',
            'RECHAZADA': 'danger'
        };
        return <Badge variant={colores[estado] || 'secondary'}>{estado}</Badge>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Notas de Ingreso</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Input
                    placeholder="Buscar por número o proveedor..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos los estados</option>
                    <option value="REGISTRADA">Registrada</option>
                    <option value="APROBADA">Aprobada</option>
                    <option value="RECHAZADA">Rechazada</option>
                </select>
                <Button onClick={cargarIngresos}>Actualizar</Button>
                <Button onClick={handleExportar} variant="secondary">Exportar a Excel</Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Número</TableHeader>
                            <TableHeader>Fecha</TableHeader>
                            <TableHeader>Proveedor</TableHeader>
                            <TableHeader>Cantidad Productos</TableHeader>
                            <TableHeader>Estado</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingresos.length > 0 ? (
                            ingresos.map((ingreso) => (
                                <TableRow key={ingreso.id}>
                                    <TableCell>{ingreso.numero_ingreso}</TableCell>
                                    <TableCell>{new Date(ingreso.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{ingreso.proveedor}</TableCell>
                                    <TableCell>{ingreso.detalles_count || 0}</TableCell>
                                    <TableCell>{getEstadoBadge(ingreso.estado)}</TableCell>
                                    <TableCell>
                                        <Button variant="secondary" size="sm">
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" style={{ textAlign: 'center' }}>
                                    No hay notas de ingreso
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
