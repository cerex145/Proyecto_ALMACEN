import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
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
        if (stock <= 0) return { label: 'Sin Stock', variant: 'anulado' };
        if (stock <= min) return { label: 'Stock Bajo', variant: 'observado' };
        return { label: 'Normal', variant: 'aprobado' };
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

    if (isEditing) {
        return (
            <ProductoForm
                productToEdit={editingProduct}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventario de Productos</h1>
                    <p className="text-slate-500">Gestión general del catálogo</p>
                </div>
                <Button onClick={handleCreate} className="shadow-lg shadow-blue-500/20">
                    + Nuevo Producto
                </Button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 items-start">
                <Card className="flex-1 w-full min-w-0">
                    <CardContent className="p-0 sm:p-0"> {/* Remove padding for table consistency */}
                        <div className="overflow-hidden rounded-xl">
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
                                        <TableRow><TableCell colSpan={7} className="text-center py-8">Cargando catálogo...</TableCell></TableRow>
                                    ) : products.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8">No se encontraron productos.</TableCell></TableRow>
                                    ) : (
                                        products.map(product => {
                                            const status = getStockStatus(product.stock_actual, product.stock_minimo);
                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-mono text-xs">{product.codigo}</TableCell>
                                                    <TableCell className="font-medium text-slate-700">{product.descripcion}</TableCell>
                                                    <TableCell>{product.laboratorio || '-'}</TableCell>
                                                    <TableCell>{product.unidad_medida}</TableCell>
                                                    <TableCell className="font-bold">{product.stock_actual}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status.variant}>{status.label}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(product)}
                                                                title="Editar producto"
                                                            >
                                                                ✏️
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => setSelectedProduct(product)}
                                                                className={selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                                                            >
                                                                Lotes
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
                    </CardContent>
                </Card>

                {selectedProduct && (
                    <div className="w-full xl:w-[450px] animate-in slide-in-from-right-4 duration-300">
                        <LoteManager
                            productId={selectedProduct.id}
                            onClose={() => setSelectedProduct(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductoList;
