import React, { useState, useEffect } from 'react';
import { kardexService } from '../../services/kardex.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';

export const KardexListCompleto = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        producto_id: '',
        producto_nombre: '',
        cliente_nombre: '',
        tipo_movimiento: '',
        fecha_desde: '',
        fecha_hasta: '',
        page: 1
    });

    useEffect(() => {
        cargarKardex();
    }, [filtros]);

    const cargarKardex = async () => {
        try {
            setLoading(true);
            const response = await kardexService.listar(filtros);
            setMovimientos(response.data || []);
        } catch (error) {
            console.error('Error al cargar kardex:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = async () => {
        try {
            const queryParams = new URLSearchParams(filtros);
            const url = `http://localhost:3000/api/kardex/exportar?${queryParams.toString()}`;

            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('download-file', {
                    url,
                    filename: 'kardex.xlsx'
                });
            } else {
                const blob = await kardexService.exportar(filtros);
                const urlObj = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = urlObj;
                a.download = 'kardex.xlsx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(urlObj);
            }
            alert('✅ Kardex descargado correctamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('❌ Error al descargar Kardex');
        }
    };

    const getTipoMovimientoBadge = (tipo) => {
        const colores = {
            'INGRESO': '#28a745',
            'SALIDA': '#dc3545',
            'AJUSTE': '#ffc107',
            'AJUSTE_POR_RECEPCION': '#17a2b8'
        };
        return <span style={{
            backgroundColor: colores[tipo] || '#6c757d',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85em'
        }}>
            {tipo}
        </span>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Kardex - Histórico de Movimientos</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div>
                    <label>Producto (Nombre o Cód.)</label>
                    <Input
                        type="text"
                        placeholder="Buscar producto..."
                        value={filtros.producto_nombre}
                        onChange={(e) => setFiltros({ ...filtros, producto_nombre: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && cargarKardex()}
                    />
                </div>
                <div>
                    <label>Cliente / Proveedor</label>
                    <Input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={filtros.cliente_nombre}
                        onChange={(e) => setFiltros({ ...filtros, cliente_nombre: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && cargarKardex()}
                    />
                </div>
                <div>
                    <label>Tipo Movimiento</label>
                    <select
                        value={filtros.tipo_movimiento}
                        onChange={(e) => setFiltros({ ...filtros, tipo_movimiento: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                    >
                        <option value="">Todos</option>
                        <option value="INGRESO">Ingreso</option>
                        <option value="SALIDA">Salida</option>
                        <option value="AJUSTE">Ajuste</option>
                        <option value="AJUSTE_POR_RECEPCION">Ajuste por Recepción</option>
                    </select>
                </div>
                <div>
                    <label>Desde</label>
                    <Input
                        type="date"
                        value={filtros.fecha_desde}
                        onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                    />
                </div>
                <div>
                    <label>Hasta</label>
                    <Input
                        type="date"
                        value={filtros.fecha_hasta}
                        onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
                    <Button onClick={cargarKardex}>Filtrar</Button>
                    <Button onClick={handleExportar} variant="secondary">Exportar</Button>
                </div>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Fecha</TableHeader>
                            <TableHeader>Producto</TableHeader>
                            <TableHeader>Lote</TableHeader>
                            <TableHeader>Cliente/Proveedor</TableHeader>
                            <TableHeader>Tipo Mov.</TableHeader>
                            <TableHeader>Documento</TableHeader>
                            <TableHeader>Cantidad</TableHeader>
                            <TableHeader>Saldo</TableHeader>
                            <TableHeader>Documento</TableHeader>
                            <TableHeader>Observaciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movimientos.length > 0 ? (
                            movimientos.map((mov) => (
                                <TableRow key={mov.id}>
                                    <TableCell>{new Date(mov.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div style={{ fontSize: '0.9em' }}>
                                            <strong>{mov.producto?.codigo || '-'}</strong><br />
                                            {mov.producto?.descripcion || `ID: ${mov.producto_id}`}
                                        </div>
                                    </TableCell>
                                    <TableCell>{mov.lote_id || mov.lote_numero || '-'}</TableCell>
                                    <TableCell>{mov.cliente_nombre || '-'}</TableCell>
                                    <TableCell>{getTipoMovimientoBadge(mov.tipo_movimiento)}</TableCell>
                                    <TableCell>{mov.documento_referencia || (mov.documento_numero ? `${mov.documento_tipo}: ${mov.documento_numero}` : '-')}</TableCell>
                                    <TableCell>
                                        <b style={{
                                            color: (mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'AJUSTE_POSITIVO' || mov.tipo_movimiento === 'AJUSTE_POR_RECEPCION') ? 'green' :
                                                (mov.tipo_movimiento === 'SALIDA' || mov.tipo_movimiento === 'AJUSTE_NEGATIVO') ? 'red' : 'inherit'
                                        }}>
                                            {(mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'AJUSTE_POSITIVO' || mov.tipo_movimiento === 'AJUSTE_POR_RECEPCION') ? '+' : (mov.tipo_movimiento === 'SALIDA' || mov.tipo_movimiento === 'AJUSTE_NEGATIVO') ? '-' : ''}{mov.cantidad}
                                        </b>
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>{mov.saldo}</TableCell>
                                    <TableCell>{mov.observaciones || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="8" style={{ textAlign: 'center' }}>
                                    No hay movimientos registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
