import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';

export const CargaMasivaForm = ({ onCancel, onSuccess }) => {
    // Modo: 'excel' o 'manual'
    const [mode, setMode] = useState('excel');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Form para el ingreso manual
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            numero_documento: '',
            detalles: []
        }
    });

    const numDoc = watch('numero_documento');

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles"
    });

    const [productoForm, setProductoForm] = useState({
        codigo: '',
        descripcion: '',
        cantidad: '',
        lote: ''
    });

    // Cambios en los inputs de producto temporal
    const handleProdChange = (e) => {
        const { name, value } = e.target;
        setProductoForm(prev => ({ ...prev, [name]: value }));
    };

    // Añadir producto a la lista manual
    const handleAddProducto = () => {
        if (!productoForm.codigo || !productoForm.descripcion) {
            alert('Código y descripción son obligatorios');
            return;
        }

        append({
            codigo: productoForm.codigo,
            descripcion: productoForm.descripcion,
            cantidad: Number(productoForm.cantidad) || 0,
            lote: productoForm.lote || ''
        });

        // Limpiar
        setProductoForm({
            codigo: '',
            descripcion: '',
            cantidad: '',
            lote: ''
        });
    };

    // Subir Excel
    const handleUploadExcel = async () => {
        if (!file) {
            alert('Por favor, selecciona un archivo Excel/CSV.');
            return;
        }
        if (!numDoc) {
            alert('El número de documento es obligatorio para asociar los productos del Excel.');
            return;
        }

        try {
            setUploading(true);
            const res = await productService.importProducts(file, numDoc);
            alert(`Éxito: ${res.message || 'Importación completada'}`);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error al importar:', error);
            const errMsg = error.response?.data?.error || error.response?.data?.errores?.join('\n') || error.message;
            alert(`Error al importar Excel:\n${errMsg}`);
        } finally {
            setUploading(false);
        }
    };

    // Enviar formulario manual
    const handleSaveManual = async (data) => {
        if (!data.numero_documento) {
            alert('El número de documento es obligatorio.');
            return;
        }
        if (data.detalles.length === 0) {
            alert('Agregue al menos un producto a la lista.');
            return;
        }

        try {
            setUploading(true);
            const payload = {
                numero_documento: data.numero_documento,
                productos: data.detalles
            };
            const res = await productService.createProductsLote(payload);
            alert(`Éxito: ${res.message || 'Productos guardados'}`);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error al guardar manual:', err);
            const errMsg = err.response?.data?.error || err.message;
            alert(`Error al guardar productos:\n${errMsg}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b">
                <CardTitle className="text-xl text-slate-800">
                    Carga Masiva de Productos al Inventario
                </CardTitle>
                <Button variant="ghost" onClick={onCancel} disabled={uploading}>✕</Button>
            </CardHeader>
            <CardContent className="p-6">

                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                        Número de Documento (General para toda la carga) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('numero_documento', { required: true })}
                        className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
                        placeholder="Ej. DOC-2026-001"
                    />
                    {errors.numero_documento && <span className="text-red-500 text-sm">Este campo es obligatorio</span>}
                </div>

                <div className="border-b mb-6">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className={`px-4 py-2 font-semibold ${mode === 'excel' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                            onClick={() => setMode('excel')}
                        >
                            Importar por Plantilla (Excel/CSV)
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 font-semibold ${mode === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                            onClick={() => setMode('manual')}
                        >
                            Ingreso por Lista Manual
                        </button>
                    </div>
                </div>

                {mode === 'excel' && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                            <h3 className="text-lg font-medium text-slate-700 mb-2">Sube tu archivo para importar</h3>
                            <p className="text-slate-500 mb-4 text-sm">
                                Los productos creados o actualizados serán asociados automáticamente al
                                <strong className="text-blue-600"> N° de Documento</strong> especificado arriba.
                            </p>

                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                            />

                            <div className="flex justify-center gap-4 mt-6">
                                <Button onClick={handleUploadExcel} disabled={uploading || !file || !numDoc} className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]">
                                    {uploading ? 'Importando...' : 'Iniciar Importación'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {mode === 'manual' && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h3 className="font-semibold text-slate-700 mb-4">Añadir producto a la lista</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={productoForm.codigo}
                                        onChange={handleProdChange}
                                        className="w-full rounded-md border-slate-300 text-sm p-2 bg-white"
                                        placeholder="Ej. PRD-001"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        name="descripcion"
                                        value={productoForm.descripcion}
                                        onChange={handleProdChange}
                                        className="w-full rounded-md border-slate-300 text-sm p-2 bg-white"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lote</label>
                                    <input
                                        type="text"
                                        name="lote"
                                        value={productoForm.lote}
                                        onChange={handleProdChange}
                                        className="w-full rounded-md border-slate-300 text-sm p-2 bg-white"
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock a sumar</label>
                                    <input
                                        type="number"
                                        name="cantidad"
                                        value={productoForm.cantidad}
                                        onChange={handleProdChange}
                                        className="w-full rounded-md border-slate-300 text-sm p-2 bg-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button type="button" onClick={handleAddProducto} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    + Añadir a la lista
                                </Button>
                            </div>
                        </div>

                        {/* Listado de agregados */}
                        {fields.length > 0 && (
                            <form onSubmit={handleSubmit(handleSaveManual)}>
                                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold text-slate-700">Código</th>
                                                <th className="px-4 py-3 font-semibold text-slate-700">Descripción</th>
                                                <th className="px-4 py-3 font-semibold text-slate-700">Lote</th>
                                                <th className="px-4 py-3 font-semibold text-slate-700">Cantidad</th>
                                                <th className="px-4 py-3 font-semibold text-slate-700 w-16 text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fields.map((field, index) => (
                                                <tr key={field.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-600 font-medium">{field.codigo}</td>
                                                    <td className="px-4 py-3 text-slate-800">{field.descripcion}</td>
                                                    <td className="px-4 py-3 text-slate-600">{field.lote || '-'}</td>
                                                    <td className="px-4 py-3 text-slate-800 font-semibold">{field.cantidad}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors text-lg"
                                                            title="Eliminar fila"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-700">Totales Productos: {fields.length}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800">
                                                    {fields.reduce((acc, curr) => acc + Number(curr.cantidad || 0), 0)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <Button type="button" variant="ghost" onClick={onCancel} disabled={uploading}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]" disabled={uploading || !numDoc}>
                                        {uploading ? 'Guardando...' : `Guardar ${fields.length} productos`}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

            </CardContent>
        </Card>
    );
};
