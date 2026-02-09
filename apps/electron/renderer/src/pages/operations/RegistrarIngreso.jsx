import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { clientesService } from '../../services/clientes.service';
import { productService } from '../../services/product.service';
import { ingresosService } from '../../services/ingresos.service';

const RegistrarIngreso = ({ onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);

    // -- Formulario "INGRESO INDIVIDUAL" --
    // Header
    const [clienteId, setClienteId] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [clienteRazonSocial, setClienteRazonSocial] = useState(''); // Store name for display/saving

    // Product Input
    const [productoId, setProductoId] = useState('');
    const [productoCodigo, setProductoCodigo] = useState('');
    const [lote, setLote] = useState('');

    // Details
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [precio, setPrecio] = useState('');

    // -- Formulario "INGRESO CANTIDAD" --
    const [tipoDocumento, setTipoDocumento] = useState('Guia Remision');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
    const [observaciones, setObservaciones] = useState('');

    // -- Lista de Items --
    const [items, setItems] = useState([]);
    const [lastSavedId, setLastSavedId] = useState(null);

    useEffect(() => {
        console.log('RegistrarIngreso: Componente Montado');
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        setLoading(true);
        try {
            console.log('RegistrarIngreso: Iniciando carga de catálogos...');

            // Cargar Clientes
            const clientesRes = await clientesService.listar({ limit: 1000 });
            console.log('RegistrarIngreso: Respuesta Clientes RAW:', clientesRes);

            let clientesData = [];
            if (clientesRes && clientesRes.data && Array.isArray(clientesRes.data)) {
                clientesData = clientesRes.data;
            } else if (Array.isArray(clientesRes)) {
                clientesData = clientesRes;
            } else if (clientesRes && clientesRes.success && Array.isArray(clientesRes.data)) {
                clientesData = clientesRes.data;
            }
            console.log('RegistrarIngreso: Clientes procesados:', clientesData.length);
            setClientes(clientesData);

            // Cargar Productos
            const productosRes = await productService.getProducts();
            console.log('RegistrarIngreso: Respuesta Productos RAW:', productosRes);

            let productosData = [];
            if (Array.isArray(productosRes)) {
                productosData = productosRes;
            } else if (productosRes && productosRes.data && Array.isArray(productosRes.data)) {
                productosData = productosRes.data;
            }
            console.log('RegistrarIngreso: Productos procesados:', productosData.length);
            setProductos(productosData);

        } catch (error) {
            console.error('RegistrarIngreso: Error cargando catálogos:', error);
            alert('Error cargando datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cambio en Combo de Clientes/Código
    const handleClienteChange = (e) => {
        const id = e.target.value;
        setClienteId(id);
        const cliente = clientes.find(c => c.id === Number(id));
        if (cliente) {
            setClienteRuc(cliente.cuit || cliente.codigo || '');
            setClienteRazonSocial(cliente.razon_social);
        } else {
            setClienteRuc('');
            setClienteRazonSocial('');
        }
    };

    // Cambio en Combo de Productos
    const handleProductoChange = (e) => {
        const id = e.target.value;
        setProductoId(id);
        const producto = productos.find(p => p.id === Number(id));
        if (producto) {
            setProductoCodigo(producto.codigo || '');
        } else {
            setProductoCodigo('');
        }
    };

    // Búsqueda por código de producto
    const handleCodigoProductoChange = (e) => {
        const codigo = e.target.value;
        setProductoCodigo(codigo);
        const producto = productos.find(p => p.codigo === codigo);
        if (producto) {
            setProductoId(producto.id);
        }
    };

    const handleAgregarItem = () => {
        if (!productoId) {
            alert('Seleccione un producto');
            return;
        }
        if (!cantidad || Number(cantidad) <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        const producto = productos.find(p => p.id === Number(productoId));

        const newItem = {
            id: Date.now(),
            producto_id: producto.id,
            producto_codigo: producto.codigo,
            producto_nombre: producto.descripcion,
            lote_numero: lote || 'SN', // Default SIN LOTE si vacio? Mejor obligar o default
            fecha_vencimiento: fechaVencimiento || null,
            cantidad: Number(cantidad),
            precio_unitario: Number(precio) || 0,
            total: (Number(cantidad) * (Number(precio) || 0)).toFixed(2)
        };

        setItems([...items, newItem]);

        // Limpiar solo campos de producto
        setProductoId('');
        setProductoCodigo('');
        setLote('');
        setFechaVencimiento('');
        setCantidad('');
        setPrecio('');
    };

    const handleEliminarItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleLimpiarTodo = () => {
        setItems([]);
        setClienteId('');
        setClienteRuc('');
        setClienteRazonSocial('');
        setLastSavedId(null);
    };

    const handleGuardarIngreso = async () => {
        if (!clienteId || items.length === 0) {
            alert('Debe seleccionar cliente y agregar productos');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                fecha: fechaIngreso,
                proveedor: clienteRazonSocial || 'Sin Nombre',
                responsable_id: 1,
                observaciones: `${tipoDocumento}: ${numeroDocumento}. ${observaciones}`,
                detalles: items.map(item => ({
                    producto_id: item.producto_id,
                    lote_numero: item.lote_numero || 'GENERICO',
                    fecha_vencimiento: item.fecha_vencimiento || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default 1 year if empty?
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario
                }))
            };

            const response = await ingresosService.crear(payload);
            const newId = response.data?.id || response.id;
            if (newId) {
                setLastSavedId(newId);
                alert(`Ingreso N° ${response.data?.numero_ingreso} Guardado!`);
            }
        } catch (error) {
            console.error('Error guardando:', error);
            alert('Error: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        if (!lastSavedId) return;
        window.open(`http://127.0.0.1:3000/api/ingresos/${lastSavedId}/pdf`, '_blank');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Title */}
            <div className="bg-purple-800 text-white p-3 shadow-md rounded-t-lg">
                <h1 className="text-xl font-bold text-center tracking-wide">CONTROLES DE NOTA DE INGRESO</h1>
            </div>

            {/* SECCION 1: INGRESO INDIVIDUAL */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-slate-200">
                <div className="mb-4">
                    <span className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm uppercase tracking-wider">
                        INGRESO INDIVIDUAL
                    </span>
                    {!loading && clientes.length === 0 && (
                        <div className="mt-2 text-red-600 font-bold bg-red-100 p-2 rounded">
                            ⚠️ Error: No se pudieron cargar los datos. Verifique la conexión con el servidor. <br />
                            <button onClick={cargarCatalogos} className="underline">Reintentar</button>
                        </div>
                    )}
                </div>

                {/* Row 1: Cliente Info & Lote */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-lg border border-purple-100 bg-purple-50/30">
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">RUC de Cliente</label>
                        <Input
                            value={clienteRuc}
                            readOnly
                            className="bg-yellow-100 border-yellow-300 text-slate-800 font-mono font-bold"
                            placeholder="Autocompletado..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1 uppercase bg-teal-600 text-white px-2 py-0.5 w-fit rounded-sm">Código Cliente</label>
                        <select
                            className="w-full h-10 text-sm border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                            value={clienteId}
                            onChange={handleClienteChange}
                            disabled={loading}
                        >
                            <option value="">{loading ? 'Cargando clientes...' : '-- Seleccionar --'}</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.codigo} - {c.razon_social}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">Lote</label>
                        <Input
                            value={lote}
                            onChange={(e) => setLote(e.target.value)}
                            className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        />
                    </div>
                </div>

                {/* Row 2: Producto */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 rounded-lg bg-teal-50/30 border border-teal-100">
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">Cod.Producto</label>
                        <Input
                            value={productoCodigo}
                            onChange={handleCodigoProductoChange}
                            className="border-slate-300"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">Producto</label>
                        <select
                            className="w-full h-10 text-sm border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                            value={productoId}
                            onChange={handleProductoChange}
                            disabled={loading}
                        >
                            <option value="">{loading ? 'Cargando productos...' : '-- Seleccionar Producto --'}</option>
                            {productos.length === 0 && !loading && <option disabled>No hay productos disponibles</option>}
                            {productos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo} - {p.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 3: Details */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-0 border border-slate-400 bg-teal-800 text-white text-xs font-bold rounded-t-md overflow-hidden text-center items-center">
                    <div className="p-2 border-r border-teal-700">Fecha Vcto</div>
                    <div className="p-2 border-r border-teal-700">UM</div>
                    <div className="p-2 border-r border-teal-700">Fabri.</div>
                    <div className="p-2 border-r border-teal-700">Temp.</div>
                    <div className="p-2 border-r border-teal-700">Cant.Bulto</div>
                    <div className="p-2 border-r border-teal-700">Cant.Cajas</div>
                    <div className="p-2">Cant.x Caja</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-0 border-x border-b border-slate-400 mb-6 bg-white">
                    <div className="p-1 border-r border-slate-200">
                        <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="h-8 text-xs border-none focus:ring-0" />
                    </div>
                    <div className="p-1 border-r border-slate-200"><Input disabled className="h-8 bg-slate-50 border-none" /></div>
                    <div className="p-1 border-r border-slate-200"><Input disabled className="h-8 bg-slate-50 border-none" /></div>
                    <div className="p-1 border-r border-slate-200"><Input disabled className="h-8 bg-slate-50 border-none" /></div>
                    {/* Using Cantidad as 'Cant.Bulto' for simplicity based on user input logic typically being quantity */}
                    <div className="p-1 border-r border-slate-200">
                        <Input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            className="h-8 text-xs font-bold text-center border-none focus:ring-0"
                        />
                    </div>
                    <div className="p-1 border-r border-slate-200"><Input disabled className="h-8 bg-slate-50 border-none" /></div>
                    <div className="p-1 bg-yellow-100"><Input disabled className="h-8 bg-transparent border-none" /></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 absolute right-12 top-28 md:static md:flex-row md:justify-end md:gap-4">
                    <Button onClick={handleAgregarItem} className="bg-green-600 hover:bg-green-700 text-white w-40 font-bold shadow-md">
                        INGRESAR
                    </Button>
                    <Button onClick={() => { }} className="bg-blue-600 hover:bg-blue-700 text-white w-40 font-bold shadow-md">
                        ELIMINAR
                    </Button>
                    <Button onClick={handleLimpiarTodo} className="bg-orange-500 hover:bg-orange-600 text-white w-40 font-bold shadow-md">
                        LIMPIAR
                    </Button>
                    <Button
                        onClick={handleGeneratePDF}
                        disabled={!lastSavedId}
                        className={`w-40 font-bold shadow-md ${lastSavedId ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-yellow-200 text-yellow-700'}`}
                    >
                        PDF
                    </Button>
                </div>
                <div className="flex justify-end mt-2">
                    <div className="bg-yellow-400 border border-slate-800 px-4 py-1 font-bold text-sm shadow-sm">
                        Cant.Total: {items.reduce((acc, i) => acc + i.cantidad, 0).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* SECCION 2: INGRESO CANTIDAD / DOCUMENTO */}
            <div className="bg-white p-5 rounded-lg shadow-md border border-slate-200 mt-6">
                <div className="mb-4">
                    <span className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm uppercase tracking-wider">
                        INGRESO CANTIDAD
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 items-end border p-4 rounded-lg border-purple-100">
                    <div className="w-56">
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">T. Documento</label>
                        <select
                            className="input-premium h-10"
                            value={tipoDocumento}
                            onChange={(e) => setTipoDocumento(e.target.value)}
                        >
                            <option>Guía Remisión</option>
                            <option>Factura</option>
                        </select>
                    </div>
                    <div className="w-56">
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">Nº de Documento</label>
                        <Input
                            value={numeroDocumento}
                            onChange={(e) => setNumeroDocumento(e.target.value)}
                            placeholder="0001-000000"
                            className="h-10"
                        />
                    </div>
                    <div className="w-40">
                        <label className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-sm block mb-1 uppercase w-fit">Fecha Ingreso</label>
                        <Input
                            type="date"
                            value={fechaIngreso}
                            onChange={(e) => setFechaIngreso(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div className="flex-1">
                        <Button
                            onClick={handleGuardarIngreso}
                            disabled={loading}
                            className="h-12 w-48 text-lg font-bold bg-red-700 hover:bg-red-800 text-white shadow-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {loading ? '...' : 'INGRESAR'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* PREVIEW TICKET / NOTA */}
            {items.length > 0 && (
                <div className="bg-white border-2 border-slate-800 p-8 shadow-2xl mx-auto max-w-5xl mt-8">
                    <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 italic">AGUPAL PERU</h2>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold uppercase tracking-widest">Nota de Ingreso</h3>
                        </div>
                        <div className="border-2 border-slate-800 p-2 font-bold">
                            N° PENDING
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm mb-6 font-mono">
                        <div className="flex gap-2"><span className="font-bold w-32">Razón Social:</span> <span>{clienteRazonSocial}</span></div>
                        <div className="flex gap-2"><span className="font-bold w-32">Código Cliente:</span> <span>{clienteId ? clientes.find(c => c.id == clienteId)?.codigo : ''}</span></div>
                        <div className="flex gap-2"><span className="font-bold w-32">RUC:</span> <span>{clienteRuc}</span></div>
                        <div className="flex gap-2"><span className="font-bold w-32">Fecha:</span> <span>{fechaIngreso}</span></div>
                    </div>

                    <table className="w-full text-xs border border-slate-800 mb-8">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="p-2 border border-slate-700">Item</th>
                                <th className="p-2 border border-slate-700">Cod.</th>
                                <th className="p-2 border border-slate-700">Producto</th>
                                <th className="p-2 border border-slate-700">Lote</th>
                                <th className="p-2 border border-slate-700">Vencimiento</th>
                                <th className="p-2 border border-slate-700">Cant.</th>
                                <th className="p-2 border border-slate-700">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td className="p-2 border border-slate-300 text-center">{idx + 1}</td>
                                    <td className="p-2 border border-slate-300 text-center">{item.producto_codigo}</td>
                                    <td className="p-2 border border-slate-300">{item.producto_nombre}</td>
                                    <td className="p-2 border border-slate-300 text-center">{item.lote_numero}</td>
                                    <td className="p-2 border border-slate-300 text-center">{item.fecha_vencimiento}</td>
                                    <td className="p-2 border border-slate-300 text-right font-bold">{item.cantidad}</td>
                                    <td className="p-2 border border-slate-300 text-right">{item.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pb-10 flex justify-center">
                <Button onClick={onCancel} variant="secondary" className="w-64">
                    Volver
                </Button>
            </div>
        </div>
    );
};

export default RegistrarIngreso;
