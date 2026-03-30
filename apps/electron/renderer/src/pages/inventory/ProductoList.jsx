import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { LoteManager } from './LoteManager';
import { ProductoForm } from './ProductoForm';
import { CargaMasivaForm } from './CargaMasivaForm';

export const ProductoList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isMassCharge, setIsMassCharge] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchDoc, setSearchDoc] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [clientes, setClientes] = useState([]);

    // Cargar clientes para el selector
    useEffect(() => {
        clientesService.listar({ limit: 200 })
            .then(r => setClientes(r.data || []))
            .catch(() => {});
    }, []);


    const loadProducts = async () => {
        try {
            setLoading(true);
            const params = { page, limit };
            if (searchName)  params.busqueda        = searchName;
            if (searchDoc)   params.numero_documento = searchDoc;
            if (clienteId)   params.cliente_id       = clienteId;

            const response = await productService.getProductsPaginated(params);
            setProducts(response.data || []);
            setPagination(response.pagination || { page, limit, total: 0, totalPages: 1 });
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, [searchName, searchDoc, clienteId, page, limit]);
    useEffect(() => { setPage(1); }, [searchName, searchDoc, clienteId]);



    const handleCreate = () => {
        setEditingProduct(null);
        setIsEditing(true);
        setIsMassCharge(false);
        setSelectedProduct(null);
    };

    const handleMassCharge = () => {
        setIsMassCharge(true);
        setIsEditing(false);
        setSelectedProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsEditing(true);
        setIsMassCharge(false);
        setSelectedProduct(null);
    };

    const handleFormSuccess = () => {
        setIsEditing(false);
        setIsMassCharge(false);
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

    if (isMassCharge) {
        return (
            <CargaMasivaForm
                onSuccess={handleFormSuccess}
                onCancel={() => setIsMassCharge(false)}
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
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Filtro: nombre / código */}
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                        <input
                            id="filtro-busqueda"
                            type="text"
                            placeholder="Buscar código o nombre..."
                            className="pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>

                    {/* Filtro: cliente */}
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🏢</span>
                        <select
                            id="filtro-cliente"
                            className="pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                        >
                            <option value="">Todos los clientes</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.razon_social}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro: N° documento */}
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📄</span>
                        <input
                            id="filtro-documento"
                            type="text"
                            placeholder="N° Documento..."
                            className="pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={searchDoc}
                            onChange={(e) => setSearchDoc(e.target.value)}
                        />
                    </div>

                    {/* Limpiar filtros */}
                    {(searchName || searchDoc || clienteId) && (
                        <button
                            onClick={() => { setSearchName(''); setSearchDoc(''); setClienteId(''); }}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2 py-2 bg-red-50 hover:bg-red-100 transition"
                            title="Limpiar filtros"
                        >
                            ✕ Limpiar
                        </button>
                    )}

                    <Button onClick={handleMassCharge} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                        + Carga Masiva
                    </Button>
                    <Button onClick={handleCreate} className="shadow-lg shadow-blue-500/20">
                        + Nuevo Producto
                    </Button>
                </div>

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
                                    return (
                                        <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {product.codigo || '-'} - {product.descripcion || '-'}
                                                </div>
                                                <Badge variant={Number(product.activo || 0) === 1 ? 'aprobado' : 'anulado'}>
                                                    {Number(product.activo || 0) === 1 ? 'Activo' : 'Inactivo'}
                                                </Badge>
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
                                                <div><span className="font-semibold">Temperatura (°C):</span> {product.temperatura ?? '25'}</div>
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

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                                <div className="text-xs text-slate-600">
                                    Mostrando página {pagination.page} de {pagination.totalPages} · Total: {pagination.total}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={page <= 1 || loading}
                                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={page >= pagination.totalPages || loading}
                                        onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
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
