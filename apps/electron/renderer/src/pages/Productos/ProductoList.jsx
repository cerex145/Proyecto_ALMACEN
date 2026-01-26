import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoteManager } from './LoteManager';
import { ProductoForm } from './ProductoForm';

export const ProductoList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null); // For Lotes
    const [isEditing, setIsEditing] = useState(false); // For Form
    const [editingProduct, setEditingProduct] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const getStockStatus = (stock, min) => {
        if (stock <= 0) return { label: 'Sin Stock', variant: 'danger' };
        if (stock <= min) return { label: 'Stock Bajo', variant: 'warning' };
        return { label: 'Normal', variant: 'success' };
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsEditing(true);
        setSelectedProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsEditing(true);
        setSelectedProduct(null);
    };

    const handleFormSuccess = () => {
        setIsEditing(false);
        loadProducts();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>Inventario de Productos</h1>
                {!isEditing && (
                    <Button onClick={handleCreate}>+ Nuevo Producto</Button>
                )}
            </div>

            {isEditing ? (
                <ProductoForm
                    productToEdit={editingProduct}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}> {/* Table Container */}
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Código</TableHeader>
                                        <TableHeader>Descripción</TableHeader>
                                        <TableHeader>Laboratorio</TableHeader>
                                        <TableHeader>U. Medida</TableHeader>
                                        <TableHeader>Stock</TableHeader>
                                        <TableHeader>Estado</TableHeader>
                                        <TableHeader>Acciones</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colspan={6}>Cargando...</TableCell></TableRow>
                                    ) : (
                                        products.map(product => {
                                            const status = getStockStatus(product.stock_actual, product.stock_minimo);
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>{product.codigo}</TableCell>
                                                    <TableCell>{product.descripcion}</TableCell>
                                                    <TableCell>{product.laboratorio || '-'}</TableCell>
                                                    <TableCell>{product.unidad_medida}</TableCell>
                                                    <TableCell>{product.stock_actual}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status.variant}>{status.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <Button
                                                                variant="secondary"
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                                onClick={() => handleEdit(product)}
                                                            >
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                                onClick={() => setSelectedProduct(product)}
                                                            >
                                                                Ver Lotes
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {selectedProduct && (
                            <div style={{ width: '400px', flexShrink: 0 }}>
                                <LoteManager
                                    productId={selectedProduct.id}
                                    onClose={() => setSelectedProduct(null)}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductoList;
