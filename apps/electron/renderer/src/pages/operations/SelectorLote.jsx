import React, { useState, useEffect, useMemo } from 'react';
import { productService } from '../../services/product.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';

/**
 * Component to select lots for a specific product and quantity.
 * Implements FEFO (First Expired First Out).
 */
export const SelectorLote = ({ productId, quantityRequired, onSelectionChange }) => {
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selections, setSelections] = useState({}); // { loteId: quantity }

    useEffect(() => {
        if (productId) {
            loadLotes();
        }
    }, [productId]);

    useEffect(() => {
        if (lotes.length > 0 && quantityRequired > 0) {
            const autoSelections = suggestLotes(lotes, quantityRequired);
            setSelections(autoSelections);
            onSelectionChange(autoSelections);
        }
    }, [lotes, quantityRequired]);

    const loadLotes = async () => {
        setLoading(true);
        try {
            const data = await productService.getLotesByProduct(productId);
            // Filter only lots with stock > 0
            const activeLotes = data
                .filter(l => Number(l.cantidad_disponible) > 0)
                .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)); // FEFO Sort
            setLotes(activeLotes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logic to suggest lots based on FEFO
     */
    const suggestLotes = (availableLotes, quantity) => {
        let remaining = parseFloat(quantity);
        const suggested = {};

        for (const lote of availableLotes) {
            if (remaining <= 0) break;

            const take = Math.min(remaining, parseFloat(lote.cantidad_disponible));
            suggested[lote.id] = take;
            remaining -= take;
        }
        return suggested;
    };

    const handleQuantityChange = (loteId, val) => {
        const newSelections = { ...selections, [loteId]: parseFloat(val) || 0 };
        setSelections(newSelections);
        onSelectionChange(newSelections);
    };

    const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0);
    const isSufficient = Math.abs(totalSelected - quantityRequired) < 0.01;

    if (loading) return <div>Cargando lotes...</div>;
    if (lotes.length === 0) return <div style={{ color: 'var(--danger-color)' }}>No hay stock disponible para este producto.</div>;

    return (
        <div style={{ marginTop: '0.5rem', background: '#f0f4f8', padding: '0.5rem', borderRadius: '4px' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                Selección de Lotes (FEFO) - Requerido: {quantityRequired}
            </h5>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Lote</TableHeader>
                        <TableHeader>Vence</TableHeader>
                        <TableHeader>Stock Disp.</TableHeader>
                        <TableHeader>Salida</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lotes.map(lote => {
                        const isSelected = !!selections[lote.id];
                        return (
                            <TableRow key={lote.id} style={{ backgroundColor: isSelected ? 'rgba(40, 167, 69, 0.05)' : 'transparent' }}>
                                <TableCell>
                                    <strong>{lote.numero_lote}</strong>
                                </TableCell>
                                <TableCell>
                                    {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{lote.cantidad_disponible}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={lote.cantidad_disponible}
                                        value={selections[lote.id] || ''}
                                        onChange={(e) => handleQuantityChange(lote.id, e.target.value)}
                                        style={{ width: '80px', marginBottom: 0, borderColor: isSelected ? 'var(--success-color)' : '' }}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 'bold', color: isSufficient ? 'var(--success-color)' : 'var(--danger-color)' }}>
                Total Asignado: {totalSelected.toFixed(2)} / {quantityRequired}
            </div>
        </div>
    );
};
