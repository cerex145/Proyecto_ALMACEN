import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const NotaIngresoForm = () => {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            numero_ingreso: '',
            tipo_documento: '',
            numero_documento: '',
            responsable_id: 1,
            detalles: []
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "detalles"
    });

    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [proveedorNombre, setProveedorNombre] = useState('');
    const [lastIngresoId, setLastIngresoId] = useState(null);

    // Calculator State
    const [cajas, setCajas] = useState('');
    const [unidadesCaja, setUnidadesCaja] = useState('');
    const [fraccion, setFraccion] = useState('');
    const [quantity, setQuantity] = useState(0);

    const [bultos, setBultos] = useState('');
    const [um, setUm] = useState('');
    const [fabricante, setFabricante] = useState('');
    const [temperaturaMin, setTemperaturaMin] = useState('');
    const [temperaturaMax, setTemperaturaMax] = useState('');

    const [lote, setLote] = useState('');
    const [vencimiento, setVencimiento] = useState('');
    const [precio, setPrecio] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedClient) {
            setClienteRuc('');
            setProveedorNombre('');
            return;
        }
        const client = clients.find(c => String(c.id) === String(selectedClient));
        if (client) {
            setClienteRuc(client.cuit || '');
            setProveedorNombre(client.razon_social || '');
        }
    }, [selectedClient, clients]);

    useEffect(() => {
        if (!selectedProduct) {
            return;
        }
        const product = products.find(p => p.id === parseInt(selectedProduct));
        setUm(product?.um || '');
        setFabricante(product?.fabricante || '');
        setTemperaturaMin(product?.temperatura_min_c ?? '');
        setTemperaturaMax(product?.temperatura_max_c ?? '');
        setLote(product?.lote || '');
        setVencimiento(product?.fecha_vencimiento || '');
    }, [selectedProduct, products]);

    const loadData = async () => {
        // Load Products
        try {
            const productsResponse = await productService.getProducts();
            console.log('Productos cargados:', productsResponse);
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error cargando productos:', error);
            alert('Error al cargar la lista de Productos. Verifique la conexión con el servidor.');
        }

        // Load Clients
        try {
            const clientsResponse = await clientesService.listar();
            console.log('Clientes cargados:', clientsResponse);
            // Handle both array (direct) or object { success, data } formats
            const clientsArray = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse.data || []);
            setClients(clientsArray);
        } catch (error) {
            console.error('Error cargando clientes:', error);
            alert('Error al cargar la lista de Proveedores. Verifique la conexión con el servidor.');
        }
    };

    // Auto-calculate quantity
    useEffect(() => {
        const c = parseInt(cajas) || 0;
        const u = parseInt(unidadesCaja) || 0;
        const f = parseInt(fraccion) || 0;
        const total = (c * u) + f;
        setQuantity(total);
    }, [cajas, unidadesCaja, fraccion]);

    const handleAddProduct = () => {
        const loteFinal = lote;
        if (!selectedProduct || !quantity || !loteFinal || !vencimiento) {
            alert("Por favor complete todos los datos del producto (Lote y Vencimiento son obligatorios)");
            return;
        }

        if (Number(quantity) <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }

        const fechaVenc = new Date(vencimiento);
        if (Number.isNaN(fechaVenc.getTime())) {
            alert('La fecha de vencimiento no es válida');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));

        const existingIndex = fields.findIndex(
            field => Number(field.producto_id) === Number(selectedProduct) && field.lote_numero === loteFinal
        );

        if (existingIndex >= 0) {
            const existing = fields[existingIndex];
            update(existingIndex, {
                ...existing,
                cantidad: Number(existing.cantidad || 0) + Number(quantity),
                cantidad_total: Number(existing.cantidad_total || existing.cantidad || 0) + Number(quantity),
                cantidad_bultos: Number(existing.cantidad_bultos || 0) + Number(bultos || 0),
                cantidad_cajas: Number(existing.cantidad_cajas || 0) + Number(cajas || 0),
                cantidad_por_caja: Number(existing.cantidad_por_caja || 0) + Number(unidadesCaja || 0),
                cantidad_fraccion: Number(existing.cantidad_fraccion || 0) + Number(fraccion || 0),
                fecha_vencimiento: vencimiento || existing.fecha_vencimiento,
                um: um || existing.um,
                fabricante: fabricante || existing.fabricante,
                temperatura_min: temperaturaMin || existing.temperatura_min,
                temperatura_max: temperaturaMax || existing.temperatura_max,
                precio_unitario: Number.isFinite(Number(precio)) ? Number(precio) : existing.precio_unitario
            });
        } else {
            append({
                producto_id: parseInt(selectedProduct),
                producto_codigo: product?.codigo || '',
                producto_nombre: product.descripcion,
                cantidad: parseFloat(quantity),
                lote_numero: loteFinal,
                fecha_vencimiento: vencimiento,
                um: um || '',
                fabricante: fabricante || '',
                temperatura_min: temperaturaMin || '',
                temperatura_max: temperaturaMax || '',
                cantidad_bultos: parseFloat(bultos || 0),
                cantidad_cajas: parseFloat(cajas || 0),
                cantidad_por_caja: parseFloat(unidadesCaja || 0),
                cantidad_fraccion: parseFloat(fraccion || 0),
                cantidad_total: parseFloat(quantity || 0),
                precio_unitario: parseFloat(precio || 0),
                detalle_calculo: `Bultos: ${bultos || 0}, Cajas: ${cajas || 0}, Und/Caja: ${unidadesCaja || 0}, Frac: ${fraccion || 0}`
            });
        }

        // Reset fields
        setSelectedProduct('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setQuantity(0);
        setBultos('');
        setUm('');
        setFabricante('');
        setTemperaturaMin('');
        setTemperaturaMax('');
        setLote('');
        setVencimiento('');
        setPrecio('');
    };

    const onSubmit = async (data) => {
        try {
            if (!selectedClient) {
                alert('Seleccione un cliente antes de guardar.');
                return;
            }
            const payload = {
                fecha: data.fecha,
                proveedor: proveedorNombre || clienteRuc || String(selectedClient),
                tipo_documento: data.tipo_documento || null,
                numero_documento: data.numero_documento || null,
                responsable_id: data.responsable_id,
                detalles: data.detalles,
                observaciones: data.numero_ingreso ? `Documento: ${data.numero_ingreso}` : undefined
            };
            const created = await operationService.createIngreso(payload);
            setLastIngresoId(created?.id || null);
            alert('✅ Nota de Ingreso registrada con éxito');
            reset();
            setQuantity(0);
        } catch (error) {
            console.error(error);
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'Verifique los datos.';
            alert(`❌ Error al registrar ingreso. ${mensaje}`);
        }
    };

    const handleExportPdf = async () => {
        if (!lastIngresoId) {
            alert('Primero guarda la nota de ingreso para exportar PDF.');
            return;
        }
        try {
            const pdfUrl = `http://localhost:3000/api/ingresos/${lastIngresoId}/pdf`;
            const opened = window.open(pdfUrl, '_blank');
            if (!opened) {
                alert('No se pudo abrir el PDF. Verifica los bloqueos de ventanas emergentes.');
            }
        } catch (error) {
            console.error(error);
            alert('Error al exportar PDF');
        }
    };

    const handleLimpiar = () => {
        reset();
        setSelectedProduct('');
        setSelectedClient('');
        setClienteRuc('');
        setProveedorNombre('');
        setLote('');
        setVencimiento('');
        setPrecio('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setQuantity(0);
        setBultos('');
        setUm('');
        setFabricante('');
        setTemperaturaMin('');
        setTemperaturaMax('');
        setLastIngresoId(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Registro de Ingreso</h2>
                    <p className="text-slate-500">Recepción de mercadería y alta de lotes</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Datos Generales */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Ingreso Individual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Código de Cliente</label>
                            <select
                                value={selectedClient}
                                onChange={(e) => {
                                    setSelectedClient(e.target.value);
                                    const client = clients.find(c => String(c.id) === String(e.target.value));
                                    if (client) {
                                        setProveedorNombre(client.razon_social || '');
                                    }
                                }}
                                className="input-premium"
                            >
                                <option value="">Seleccione cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.codigo} - {client.razon_social}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">RUC de Cliente</label>
                            <input value={clienteRuc} readOnly className="input-premium" />
                        </div>
                        <div>
                            <label className="label-premium">Lote</label>
                            <input
                                value={lote}
                                onChange={(e) => setLote(e.target.value)}
                                type="text"
                                className="input-premium"
                                placeholder="Ingrese lote..."
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Datos del Documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Tipo de Documento</label>
                            <select
                                {...register('tipo_documento')}
                                className="input-premium"
                            >
                                <option value="">Seleccione...</option>
                                <option value="Factura">Factura</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Boleta de Venta">Boleta de Venta</option>
                                <option value="Guía de Remisión Remitente">Guía de Remisión Remitente</option>
                                <option value="Guía de Remisión Transportista">Guía de Remisión Transportista</option>
                                <option value="Orden de Compra">Orden de Compra</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Número de Documento</label>
                            <input
                                {...register('numero_documento')}
                                type="text"
                                className="input-premium"
                                placeholder="Ej: F001-000213"
                            />
                        </div>
                        <div>
                            <label className="label-premium">Fecha de Ingreso</label>
                            <input
                                {...register('fecha', { required: 'Requerido' })}
                                type="date"
                                className="input-premium"
                            />
                        </div>
                    </div>
                </Card>

                {/* Agregar Productos */}
                <Card className="p-6 bg-blue-50/50 border-blue-100">
                    <div className="flex flex-wrap gap-2 justify-end mb-4">
                        <Button type="button" onClick={handleAddProduct} variant="primary">
                            Ingresar
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => fields.length > 0 && remove(fields.length - 1)}>
                            Eliminar
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleLimpiar}>
                            Limpiar
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleExportPdf}>
                            PDF
                        </Button>
                    </div>

                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Detalle de Productos (Lotes)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <label className="label-premium">Producto</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="input-premium"
                            >
                                <option value="">Seleccione producto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Vencimiento</label>
                            <input
                                value={vencimiento}
                                onChange={(e) => setVencimiento(e.target.value)}
                                type="date"
                                className="input-premium"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-premium">UM</label>
                            <select
                                value={um}
                                onChange={(e) => setUm(e.target.value)}
                                className="input-premium"
                            >
                                <option value=""></option>
                                <option value="AMP">AMP</option>
                                <option value="FRS">FRS</option>
                                <option value="BLT">BLT</option>
                                <option value="TUB">TUB</option>
                                <option value="SOB">SOB</option>
                                <option value="CJ">CJ</option>
                                <option value="KG">KG</option>
                                <option value="G">G</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Fabricante</label>
                            <input
                                value={fabricante}
                                onChange={(e) => setFabricante(e.target.value)}
                                type="text"
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Temp. Min (°C)</label>
                            <input
                                value={temperaturaMin}
                                onChange={(e) => setTemperaturaMin(e.target.value)}
                                type="number"
                                step="0.01"
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Temp. Max (°C)</label>
                            <input
                                value={temperaturaMax}
                                onChange={(e) => setTemperaturaMax(e.target.value)}
                                type="number"
                                step="0.01"
                                className="input-premium"
                            />
                        </div>

                        {/* Calculator Section */}
                        <div className="md:col-span-6 grid grid-cols-3 gap-2 p-2 bg-white rounded-lg border border-blue-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Bulto</label>
                                <input
                                    type="number"
                                    value={bultos}
                                    onChange={(e) => setBultos(e.target.value)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cajas</label>
                                <input
                                    type="number"
                                    value={cajas}
                                    onChange={(e) => setCajas(e.target.value)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Und/Caja</label>
                                <input
                                    type="number"
                                    value={unidadesCaja}
                                    onChange={(e) => setUnidadesCaja(e.target.value)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Fracción</label>
                                <input
                                    type="number"
                                    value={fraccion}
                                    onChange={(e) => setFraccion(e.target.value)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-3 flex justify-between items-center pt-1 border-t border-slate-100 mt-1">
                                <span className="text-xs text-slate-400 font-medium">Total Unidades:</span>
                                <span className="font-bold text-blue-600 text-lg">{quantity}</span>
                            </div>
                        </div>

                        <div className="md:col-span-12 flex justify-end">
                            <Button type="button" onClick={handleAddProduct} variant="primary" className="w-full md:w-auto">
                                + Agregar Item
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Tabla de Items */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Cod.Producto</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Lote</th>
                                <th className="px-6 py-4">Vencimiento</th>
                                <th className="px-6 py-4">UM</th>
                                <th className="px-6 py-4">Fabri.</th>
                                <th className="px-6 py-4">Temp. Min</th>
                                <th className="px-6 py-4">Temp. Max</th>
                                <th className="px-6 py-4">Cant.Bulto</th>
                                <th className="px-6 py-4">Cant.Cajas</th>
                                <th className="px-6 py-4">Cant.x Caja</th>
                                <th className="px-6 py-4">Cant.Fracción</th>
                                <th className="px-6 py-4 text-right">Cant.Total</th>
                                <th className="px-6 py-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-mono text-xs">{field.producto_codigo || '-'}</td>
                                    <td className="px-6 py-3 font-medium text-slate-700">{field.producto_nombre}</td>
                                    <td className="px-6 py-3">{field.lote_numero}</td>
                                    <td className="px-6 py-3">{field.fecha_vencimiento}</td>
                                    <td className="px-6 py-3">{field.um || '-'}</td>
                                    <td className="px-6 py-3">{field.fabricante || '-'}</td>
                                    <td className="px-6 py-3">{field.temperatura_min ?? '-'}</td>
                                    <td className="px-6 py-3">{field.temperatura_max ?? '-'}</td>
                                    <td className="px-6 py-3">{field.cantidad_bultos ?? 0}</td>
                                    <td className="px-6 py-3">{field.cantidad_cajas ?? 0}</td>
                                    <td className="px-6 py-3">{field.cantidad_por_caja ?? 0}</td>
                                    <td className="px-6 py-3">{field.cantidad_fraccion ?? 0}</td>
                                    <td className="px-6 py-3 text-right font-bold text-blue-600">{field.cantidad_total ?? field.cantidad}</td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 px-2 py-1 rounded-lg"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fields.length === 0 && (
                                <tr>
                                    <td colSpan={14} className="px-6 py-8 text-center text-slate-400 italic">
                                        No hay productos agregados a la nota.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleLimpiar}
                    >
                        Limpiar
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleExportPdf}
                    >
                        Exportar a PDF
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={fields.length === 0}
                        size="lg"
                        className="btn-gradient-primary shadow-lg shadow-blue-500/30"
                    >
                        Ingresar
                    </Button>
                </div>
            </form>
        </div>
    );
};
