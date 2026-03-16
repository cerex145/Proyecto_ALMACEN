import React, { useState, useEffect } from 'react';
import { clientesService } from '../../services/clientes.service';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Parsea un CSV respetando comillas y separador coma */
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const splitLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        result.push(current.trim());
        return result;
    };

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const rows = lines.slice(1).map(l => {
        const vals = splitLine(l);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
        return obj;
    });
    return { headers, rows };
}

/** Descarga la plantilla Excel formateada desde el backend */
async function descargarPlantilla() {
    try {
        const blob = await productService.descargarPlantilla();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_carga_masiva_productos.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert(`No se pudo descargar la plantilla: ${error.message || 'Error desconocido'}`);
    }
}

// ─── Componente principal ──────────────────────────────────────────────────────

export const CargaMasivaForm = ({ onCancel, onSuccess }) => {
    // ── Datos globales (comunes para todos los productos) ──
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState('');
    const [razonSocial, setRazonSocial] = useState('');
    const [ruc, setRuc] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [registroSanitario, setRegistroSanitario] = useState('');
    const [categoriaIngreso, setCategoriaIngreso] = useState('');

    // ── Archivo y previsualizacion ──
    const [mode, setMode] = useState('excel'); // 'excel' | 'manual'
    const [file, setFile] = useState(null);
    const [previewRows, setPreviewRows] = useState([]); // filas validadas del CSV
    const [erroresCSV, setErroresCSV] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [resultado, setResultado] = useState(null); // respuesta final

    // ── Carga manual ──
    const [manualRows, setManualRows] = useState([]);
    const [manualForm, setManualForm] = useState({
        codigo: '', descripcion: '', lote: '', fabricante: '',
        fecha_vencimiento: '', um: '', r_i: '', codigo_gln: '',
        fecha_ingreso: '', codigo_interno: '',
        temperatura_min_c: '', temperatura_max_c: '',
        cantidad_bultos: '0', cantidad_cajas: '0',
        cantidad_por_caja: '0', cantidad_fraccion: '0',
        cantidad_total: '0', observaciones: ''
    });

    // ── Cargar clientes al montar ──
    useEffect(() => {
        clientesService.listar()
            .then(data => setClientes(data.data || data || []))
            .catch(err => console.error('Error cargando clientes:', err));
    }, []);

    // ── Auto-completar al seleccionar cliente ──
    const handleClienteChange = (e) => {
        const id = e.target.value;
        setClienteId(id);
        const cli = clientes.find(c => String(c.id) === String(id));
        if (cli) {
            setRazonSocial(cli.razon_social || '');
            setRuc(cli.cuit || '');
            setProveedor(cli.razon_social || '');
        } else {
            setRazonSocial(''); setRuc(''); setProveedor('');
        }
    };

    // ── Procesar archivo: lo envía al backend para parsear por posición de columna ──
    const handleFile = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreviewRows([]);
        setErroresCSV([]);
        setResultado(null);

        try {
            const formData = new FormData();
            formData.append('file', f);

            const res = await fetch('http://localhost:3000/api/productos/parsear-plantilla', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setErroresCSV([data.error || 'Error al leer el archivo']);
                return;
            }

            setErroresCSV(data.errores || []);
            setPreviewRows(data.filas || []);

            if ((data.filas || []).length === 0 && (data.errores || []).length === 0) {
                setErroresCSV(['El archivo no contiene productos. Verifica que hayas llenado desde la fila 4.']);
            }
        } catch (err) {
            setErroresCSV([`No se pudo leer el archivo: ${err.message}`]);
        }
    };


    // ── Validar campos globales comunes ──
    const validarGlobales = (filas) => {
        const globalVacio = !numeroDocumento || !numeroDocumento.trim();
        const filasIncompletas = filas.some(f => !f.numero_documento || !String(f.numero_documento).trim());

        if (globalVacio && filasIncompletas) {
            alert('El Número de Documento es obligatorio (puedes llenarlo en el panel izquierdo o directamente en cada fila del archivo Excel).');
            return false;
        }
        return true;
    };

    // ── Guardar productos del CSV ──
    const handleGuardarCSV = async () => {
        if (!validarGlobales(previewRows)) return;
        if (previewRows.length === 0) { alert('No hay productos válidos en el archivo.'); return; }

        const globales = {
            proveedor: proveedor || razonSocial,
            tipo_documento: tipoDocumento || null,
            numero_documento: numeroDocumento || null,
            registro_sanitario: registroSanitario || null,
            categoria_ingreso: categoriaIngreso || null,
        };

        const productos = previewRows.map(p => ({ ...globales, ...p, temperatura: 25.0 }));

        try {
            setUploading(true);
            let insertados = 0, actualizados = 0;
            for (const prod of productos) {
                try {
                    await productService.createProduct({ ...prod, stock_actual: prod.cantidad_total, activo: true });
                    insertados++;
                } catch {
                    try {
                        const existing = await productService.getProducts({ busqueda: prod.codigo });
                        const found = (existing || []).find(p => p.codigo === prod.codigo);
                        if (found) {
                            await productService.updateProduct(found.id, { ...prod, stock_actual: prod.cantidad_total });
                            actualizados++;
                        }
                    } catch (e2) {
                        console.error('Error actualizando', prod.codigo, e2);
                    }
                }
            }
            setResultado({ insertados, actualizados, total: productos.length });
        } catch (err) {
            alert('Error al guardar productos: ' + (err.message || ''));
        } finally {
            setUploading(false);
        }
    };

    // ── Carga manual: agregar fila ──
    const handleAddManual = () => {
        if (!manualForm.codigo || !manualForm.descripcion) {
            alert('Código y descripción son obligatorios'); return;
        }
        setManualRows(prev => [...prev, { ...manualForm, id: Date.now() }]);
        setManualForm({
            codigo: '', descripcion: '', lote: '', fabricante: '',
            fecha_vencimiento: '', um: '', r_i: '', codigo_gln: '',
            fecha_ingreso: '', codigo_interno: '',
            temperatura_min_c: '', temperatura_max_c: '',
            cantidad_bultos: '0', cantidad_cajas: '0',
            cantidad_por_caja: '0', cantidad_fraccion: '0',
            cantidad_total: '0', observaciones: ''
        });
    };

    // ── Guardar carga manual ──
    const handleGuardarManual = async () => {
        if (!validarGlobales(manualRows)) return;
        if (manualRows.length === 0) { alert('Agregue al menos un producto.'); return; }

        const globales = {
            proveedor: proveedor || razonSocial,
            tipo_documento: tipoDocumento || null,
            numero_documento: numeroDocumento || null,
            registro_sanitario: registroSanitario || null,
            categoria_ingreso: categoriaIngreso || null,
        };

        try {
            setUploading(true);
            let insertados = 0, actualizados = 0;
            for (const row of manualRows) {
                const prod = {
                    ...globales,
                    codigo: row.codigo,
                    descripcion: row.descripcion,
                    lote: row.lote || null,
                    fabricante: row.fabricante || null,
                    fecha_vencimiento: row.fecha_vencimiento || null,
                    r_i: row.r_i || null,
                    codigo_gln: row.codigo_gln || null,
                    fecha_ingreso: row.fecha_ingreso || null,
                    codigo_interno: row.codigo_interno || null,
                    um: row.um || null,
                    temperatura: 25.0,
                    cantidad_bultos: Number(row.cantidad_bultos || 0),
                    cantidad_cajas: Number(row.cantidad_cajas || 0),
                    cantidad_por_caja: Number(row.cantidad_por_caja || 0),
                    cantidad_fraccion: Number(row.cantidad_fraccion || 0),
                    cantidad_total: Number(row.cantidad_total || 0),
                    stock_actual: Number(row.cantidad_total || 0),
                    observaciones: row.observaciones || null,
                    activo: true
                };
                try {
                    await productService.createProduct(prod);
                    insertados++;
                } catch {
                    try {
                        const existing = await productService.getProducts({ busqueda: prod.codigo });
                        const found = (existing || []).find(p => p.codigo === prod.codigo);
                        if (found) { await productService.updateProduct(found.id, prod); actualizados++; }
                    } catch (e2) { console.error('Error actualizando', prod.codigo, e2); }
                }
            }
            setResultado({ insertados, actualizados, total: manualRows.length });
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">📦 Carga Masiva de Productos</h2>
                    <p className="text-slate-500 text-sm">Configura los datos globales y sube tu archivo</p>
                </div>
                <Button variant="ghost" onClick={onCancel} disabled={uploading}>✕ Cancelar</Button>
            </div>

            {/* ── PANEL RESULTADO ── */}
            {resultado && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
                    <div className="text-5xl">✅</div>
                    <h3 className="text-xl font-bold text-green-800">¡Carga completada!</h3>
                    <div className="flex justify-center gap-8 text-sm">
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{resultado.insertados}</div>
                            <div className="text-slate-500">Creados</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">{resultado.actualizados}</div>
                            <div className="text-slate-500">Actualizados</div>
                        </div>
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-2xl font-bold text-slate-700">{resultado.total}</div>
                            <div className="text-slate-500">Total</div>
                        </div>
                    </div>
                    <Button onClick={onSuccess} className="bg-green-600 hover:bg-green-700 text-white">
                        Ir al inventario
                    </Button>
                </div>
            )}

            {!resultado && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ══ COLUMNA IZQUIERDA: Datos Globales ══ */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 sticky top-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
                                🏢 Datos Globales del Proveedor
                            </h3>
                            <p className="text-xs text-slate-400 -mt-1">
                                Estos campos se aplicarán a <strong>todos</strong> los productos de la carga.
                            </p>

                            {/* Cliente */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Código Cliente/Proveedor</label>
                                <select
                                    value={clienteId}
                                    onChange={handleClienteChange}
                                    className="w-full h-9 rounded border border-gray-300 bg-white text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.codigo} - {c.razon_social}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                                <input value={razonSocial} readOnly className="w-full h-9 rounded border border-gray-200 bg-gray-50 text-sm px-2" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">RUC / CUIT</label>
                                <input value={ruc} readOnly className="w-full h-9 rounded border border-gray-200 bg-gray-50 text-sm px-2" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
                                <input
                                    value={proveedor}
                                    onChange={e => setProveedor(e.target.value)}
                                    className="w-full h-9 rounded border border-gray-300 text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nombre del proveedor"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">T. Documento</label>
                                <select
                                    value={tipoDocumento}
                                    onChange={e => setTipoDocumento(e.target.value)}
                                    className="w-full h-9 rounded border border-gray-300 bg-white text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Factura">Factura</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Boleta de Venta">Boleta de Venta</option>
                                    <option value="Guía de Remisión Remitente">Guía de Remisión Remitente</option>
                                    <option value="Guía de Remisión Transportista">Guía de Remisión Transportista</option>
                                    <option value="Orden de Compra">Orden de Compra</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Número de Documento
                                </label>
                                <input
                                    value={numeroDocumento}
                                    onChange={e => setNumeroDocumento(e.target.value)}
                                    className="w-full h-9 rounded border border-gray-300 text-sm px-2 focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="Ej: F001-000213"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Registro Sanitario</label>
                                <input
                                    value={registroSanitario}
                                    onChange={e => setRegistroSanitario(e.target.value)}
                                    className="w-full h-9 rounded border border-gray-300 text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría Ingreso</label>
                                <select
                                    value={categoriaIngreso}
                                    onChange={e => setCategoriaIngreso(e.target.value)}
                                    className="w-full h-9 rounded border border-gray-300 bg-white text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="IMPORTACION">IMPORTACIÓN</option>
                                    <option value="COMPRA_LOCAL">COMPRA LOCAL</option>
                                    <option value="TRASLADO">TRASLADO</option>
                                    <option value="DEVOLUCION">DEVOLUCIÓN</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ══ COLUMNA DERECHA: Productos ══ */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            {[
                                { key: 'excel', label: '📊 Importar CSV/Excel' },
                                { key: 'manual', label: '✏️ Ingreso Manual' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => { setMode(tab.key); setResultado(null); }}
                                    className={`px-5 py-3 text-sm font-semibold transition-colors ${mode === tab.key
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab: CSV/Excel ── */}
                        {mode === 'excel' && (
                            <div className="space-y-4">
                                {/* Zona de carga */}
                                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-4">
                                    <div className="text-5xl">📊</div>
                                    <h3 className="font-semibold text-slate-800 text-lg">Sube tu archivo Excel completado</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                                        1. Descarga la plantilla &nbsp;➜&nbsp; 2. Llena los productos &nbsp;➜&nbsp; 3. Sube el archivo aquí
                                    </p>

                                    <button
                                        type="button"
                                        onClick={descargarPlantilla}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md shadow-green-500/20 transition-colors"
                                    >
                                        ⬇️ Descargar Plantilla Excel (.xlsx)
                                    </button>
                                    <p className="text-xs text-slate-400">
                                        La plantilla incluye instrucciones, ejemplos de relleno y columnas con colores
                                    </p>

                                    <div className="border-t border-slate-200 pt-4">
                                        <p className="text-xs font-semibold text-slate-500 mb-2">Ya la llenaste? Súbela aquí:</p>
                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFile}
                                            className="block mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>

                                {/* Nota amigable */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                                    <div className="text-2xl mt-0.5">💡</div>
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p className="font-bold">¿Cómo funciona la plantilla?</p>
                                        <p>La plantilla Excel ya tiene las columnas listas con colores y ejemplos de relleno. Solo borra los ejemplos y escribe tus productos desde la fila 4.</p>
                                        <p>Las columnas marcadas con <strong>⭐</strong> en verde son las únicas obligatorias: <strong>Código</strong>, <strong>Descripción</strong> y <strong>Cant. Total</strong>. Todo lo demás es opcional.</p>
                                        <p>La columna <strong>UM</strong> tiene un menú desplegable para elegir la unidad.</p>
                                    </div>
                                </div>

                                {/* Errores */}
                                {erroresCSV.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-red-700 mb-2">⚠️ Errores encontrados:</h4>
                                        <ul className="text-xs text-red-600 space-y-1">
                                            {erroresCSV.map((e, i) => <li key={i}>• {e}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Preview */}
                                {previewRows.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-slate-700">
                                                Vista previa — <span className="text-blue-600">{previewRows.length} productos</span>
                                            </h4>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                                    <tr>
                                                        {['#', 'Código', 'Descripción', 'Lote', 'Fabricante', 'F. Venc.', 'UM', 'Cant. Total'].map(h => (
                                                            <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {previewRows.map((row, i) => (
                                                        <tr key={i} className="hover:bg-blue-50/40">
                                                            <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                                                            <td className="px-3 py-2 font-mono font-bold text-slate-700">{row.codigo}</td>
                                                            <td className="px-3 py-2 text-slate-600 max-w-[180px] truncate">{row.descripcion}</td>
                                                            <td className="px-3 py-2">{row.lote || '-'}</td>
                                                            <td className="px-3 py-2">{row.fabricante || '-'}</td>
                                                            <td className="px-3 py-2">{row.fecha_vencimiento || '-'}</td>
                                                            <td className="px-3 py-2">{row.um || '-'}</td>
                                                            <td className="px-3 py-2 font-bold text-blue-700 text-right">{row.cantidad_total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={handleGuardarCSV}
                                                disabled={uploading}
                                                className="bg-green-600 hover:bg-green-700 text-white min-w-[220px] h-11 text-base font-bold shadow-lg shadow-green-500/20"
                                            >
                                                {uploading ? '⏳ Guardando...' : `✅ Guardar ${previewRows.length} productos`}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab: Manual ── */}
                        {mode === 'manual' && (
                            <div className="space-y-4">
                                {/* Formulario de fila */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-slate-600 mb-3">➕ Agregar producto</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { key: 'codigo', label: 'Código *', placeholder: 'MED-001' },
                                            { key: 'descripcion', label: 'Descripción *', placeholder: 'Nombre del producto', span: 2 },
                                            { key: 'lote', label: 'Lote', placeholder: 'L-2024-001' },
                                            { key: 'fabricante', label: 'Fabricante', placeholder: 'Laboratorio...' },
                                            { key: 'fecha_vencimiento', label: 'F. Vencimiento', type: 'date' },
                                            { key: 'r_i', label: 'R/I' },
                                            { key: 'codigo_gln', label: 'Código GLN' },
                                            { key: 'fecha_ingreso', label: 'Fecha Ingreso', type: 'date' },
                                            { key: 'codigo_interno', label: 'Cod. Interno' },
                                        ].map(({ key, label, placeholder, type, span }) => (
                                            <div key={key} className={span ? `col-span-${span}` : ''}>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                                                <input
                                                    type={type || 'text'}
                                                    value={manualForm[key]}
                                                    onChange={e => setManualForm(p => ({ ...p, [key]: e.target.value }))}
                                                    className="w-full h-9 rounded border border-gray-300 text-sm px-2 focus:ring-2 focus:ring-blue-500"
                                                    placeholder={placeholder}
                                                />
                                            </div>
                                        ))}

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">UM</label>
                                            <select
                                                value={manualForm.um}
                                                onChange={e => setManualForm(p => ({ ...p, um: e.target.value }))}
                                                className="w-full h-9 rounded border border-gray-300 bg-white text-sm px-2"
                                            >
                                                <option value=""></option>
                                                {['AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Temperatura (°C)</label>
                                            <input value="25" readOnly className="w-full h-9 rounded border border-gray-300 bg-gray-50 px-2 text-sm text-gray-500" />
                                        </div>

                                        {/* Cantidades */}
                                        {[
                                            { key: 'cantidad_bultos', label: 'Cant. Bultos' },
                                            { key: 'cantidad_cajas', label: 'Cant. Cajas' },
                                            { key: 'cantidad_por_caja', label: 'Cant. x Caja' },
                                            { key: 'cantidad_fraccion', label: 'Cant. Fracción' },
                                            { key: 'cantidad_total', label: 'Cant. TOTAL *' },
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                                                <input type="number" step="0.01" value={manualForm[key]}
                                                    onChange={e => setManualForm(p => ({ ...p, [key]: e.target.value }))}
                                                    className="w-full h-9 rounded border border-gray-300 text-sm px-2" />
                                            </div>
                                        ))}

                                        <div className="col-span-2 sm:col-span-3">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
                                            <input value={manualForm.observaciones}
                                                onChange={e => setManualForm(p => ({ ...p, observaciones: e.target.value }))}
                                                className="w-full h-9 rounded border border-gray-300 text-sm px-2"
                                                placeholder="Opcional" />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Button type="button" onClick={handleAddManual}
                                            className="bg-blue-600 hover:bg-blue-700 text-white">
                                            + Añadir a la lista
                                        </Button>
                                    </div>
                                </div>

                                {/* Tabla de productos ingresados */}
                                {manualRows.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-700">
                                            Lista — <span className="text-blue-600">{manualRows.length} productos</span>
                                        </h4>
                                        <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                                    <tr>
                                                        {['Código', 'Descripción', 'Lote', 'Fabricante', 'F. Venc.', 'UM', 'Cant. Total', ''].map(h => (
                                                            <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {manualRows.map((row, i) => (
                                                        <tr key={row.id} className="hover:bg-blue-50/40">
                                                            <td className="px-3 py-2 font-mono font-bold">{row.codigo}</td>
                                                            <td className="px-3 py-2 max-w-[160px] truncate">{row.descripcion}</td>
                                                            <td className="px-3 py-2">{row.lote || '-'}</td>
                                                            <td className="px-3 py-2">{row.fabricante || '-'}</td>
                                                            <td className="px-3 py-2">{row.fecha_vencimiento || '-'}</td>
                                                            <td className="px-3 py-2">{row.um || '-'}</td>
                                                            <td className="px-3 py-2 font-bold text-blue-700 text-right">{row.cantidad_total}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setManualRows(prev => prev.filter((_, j) => j !== i))}
                                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"
                                                                >✕</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={handleGuardarManual}
                                                disabled={uploading}
                                                className="bg-green-600 hover:bg-green-700 text-white min-w-[220px] h-11 text-base font-bold shadow-lg shadow-green-500/20"
                                            >
                                                {uploading ? '⏳ Guardando...' : `✅ Guardar ${manualRows.length} productos`}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
