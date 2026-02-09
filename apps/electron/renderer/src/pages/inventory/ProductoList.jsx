import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
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
                        {loading ? (
                            <div className="text-center py-8">Cargando catálogo...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8">No se encontraron productos.</div>
                        ) : (
                            <div className="grid gap-4 p-4">
                                {products.map(product => {
                                    const status = getStockStatus(product.stock_actual, product.stock_minimo);
                                    return (
                                        <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {product.codigo || '-'} - {product.descripcion || '-'}
                                                </div>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600">
                                                <div><span className="font-semibold">Proveedor:</span> {product.proveedor || '-'}</div>
                                                <div><span className="font-semibold">T. Documento:</span> {product.tipo_documento || '-'}</div>
                                                <div><span className="font-semibold">N° Documento:</span> {product.numero_documento || '-'}</div>
                                                <div><span className="font-semibold">Registro Sanitario:</span> {product.registro_sanitario || '-'}</div>
                                                <div><span className="font-semibold">Código Producto:</span> {product.codigo || '-'}</div>
                                                <div><span className="font-semibold">Producto:</span> {product.descripcion || '-'}</div>
                                                <div><span className="font-semibold">Lote:</span> {product.lote || '-'}</div>
                                                <div><span className="font-semibold">Fabricante:</span> {product.fabricante || '-'}</div>
                                                <div><span className="font-semibold">Procedencia:</span> {product.procedencia || '-'}</div>
                                                <div><span className="font-semibold">Vencimiento:</span> {product.fecha_vencimiento ? new Date(product.fecha_vencimiento).toLocaleDateString() : '-'}</div>
                                                <div><span className="font-semibold">Unidad:</span> {product.unidad || 'UND'}{product.unidad === 'OTRO' && product.unidad_otro ? ` (${product.unidad_otro})` : ''}</div>
                                                <div><span className="font-semibold">UM:</span> {product.um || '-'}</div>
                                                <div><span className="font-semibold">Temp. Min (°C):</span> {product.temperatura_min_c ?? '-'}</div>
                                                <div><span className="font-semibold">Temp. Max (°C):</span> {product.temperatura_max_c ?? '-'}</div>
                                                <div><span className="font-semibold">Bultos:</span> {product.cantidad_bultos ?? 0}</div>
                                                <div><span className="font-semibold">Cajas:</span> {product.cantidad_cajas ?? 0}</div>
                                                <div><span className="font-semibold">Por Caja:</span> {product.cantidad_por_caja ?? 0}</div>
                                                <div><span className="font-semibold">Fracción:</span> {product.cantidad_fraccion ?? 0}</div>
                                                <div><span className="font-semibold">Cantidad Total:</span> {product.cantidad_total ?? 0}</div>
                                                <div><span className="font-semibold">Stock:</span> {product.stock_actual ?? 0}</div>
                                                <div><span className="font-semibold">Categoría Ingreso:</span> {product.categoria_ingreso || '-'}</div>
                                                <div className="md:col-span-2 lg:col-span-3"><span className="font-semibold">Observaciones:</span> {product.observaciones || '-'}</div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                    title="Editar producto"
                                                >
                                                    ✏️ Editar
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
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
