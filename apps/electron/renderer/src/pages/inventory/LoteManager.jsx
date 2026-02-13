import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const LoteManager = ({ productId, onClose }) => {
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            loadLotes();
        }
    }, [productId]);

    const loadLotes = async () => {
        try {
            setLoading(true);
            const data = await productService.getLotesByProduct(productId);
            if (Array.isArray(data) && data.length > 0) {
                setLotes(data);
                return;
            }

            const producto = await productService.getProductById(productId);
            if (producto?.lote) {
                setLotes([
                    {
                        id: `producto-${productId}`,
                        numero_lote: producto.lote,
                        fecha_vencimiento: producto.fecha_vencimiento || null,
                        cantidad_disponible: producto.stock_actual ?? 0,
                        cantidad_ingresada: producto.cantidad_total ?? 0
                    }
                ]);
            } else {
                setLotes([]);
            }
        } catch (error) {
            console.error('Error loading lotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const isExpiringSoon = (dateString) => {
        if (!dateString) return false;
        const expiry = new Date(dateString);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 30; // Less than 30 days
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '1rem', backgroundColor: 'var(--light-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Gestión de Lotes</h3>
                <Button variant="secondary" onClick={onClose} size="small">Cerrar</Button>
            </div>

            {loading ? (
                <p>Cargando lotes...</p>
            ) : lotes.length === 0 ? (
                <p>No hay lotes registrados para este producto.</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Lote</TableHeader>
                            <TableHeader>Vencimiento</TableHeader>
                            <TableHeader>Stock</TableHeader>
                            <TableHeader>Estado</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lotes.map(lote => {
                            const expiring = isExpiringSoon(lote.fecha_vencimiento);
                            const stockLote = lote.cantidad_disponible ?? lote.stock_lote ?? lote.cantidad_ingresada ?? 0;
                            const stockValue = Number(stockLote) || 0;
                            return (
                                <TableRow key={lote.id}>
                                    <TableCell>
                                        <strong>{lote.numero_lote}</strong>
                                    </TableCell>
                                    <TableCell>
                                        <span style={{
                                            color: expiring ? 'var(--danger-color)' : 'inherit',
                                            fontWeight: expiring ? 'bold' : 'normal'
                                        }}>
                                            {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'N/A'}
                                            {expiring && ' ⚠️'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{stockValue}</TableCell>
                                    <TableCell>
                                        <Badge variant={stockValue > 0 ? 'activo' : 'inactivo'}>
                                            {stockValue > 0 ? 'Activo' : 'Agotado'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
