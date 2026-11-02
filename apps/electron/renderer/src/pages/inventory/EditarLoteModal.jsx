import { useEffect, useRef, useState } from 'react';
import { productService } from '../../services/product.service';

const dateKey = value => value ? String(value).slice(0, 10) : null;

export function EditarLoteModal({ fila, onClose, onSaved }) {
    const [numero, setNumero] = useState(fila._lote_numero || '');
    const [fecha, setFecha] = useState(dateKey(fila._lote_vencimiento) || '');
    const [motivo, setMotivo] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const dialogRef = useRef(null);
    const submitting = useRef(false);
    const changed = numero.trim() !== fila._lote_numero || (fecha || null) !== dateKey(fila._lote_vencimiento);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previous = document.activeElement;
        dialog.showModal();
        return () => { dialog.close(); previous?.focus(); };
    }, []);

    const save = async event => {
        event.preventDefault();
        if (submitting.current || !changed) return;
        submitting.current = true;
        setSaving(true);
        setError('');
        try {
            const updated = await productService.correctLotData(fila._lote_id, {
                numero_lote: numero.trim(), fecha_vencimiento: fecha || null, motivo: motivo.trim(),
                anterior: { numero_lote: fila._lote_numero, fecha_vencimiento: dateKey(fila._lote_vencimiento) }
            });
            onSaved(updated);
        } catch (err) {
            const status = err?.response?.status;
            setError(status === 404 && err?.response?.data?.error === 'Not Found' ? 'Esta opción aún no está disponible en el servidor. Intente nuevamente cuando se publique la actualización.'
                : err?.response?.data?.error || 'No se pudo guardar la corrección. Intente nuevamente.');
        } finally {
            submitting.current = false;
            setSaving(false);
        }
    };

    return (
        <dialog ref={dialogRef} aria-labelledby="editar-lote-titulo"
            onCancel={event => { event.preventDefault(); if (!submitting.current) onClose(); }}
            className="w-[calc(100%_-_2rem)] max-w-lg rounded-xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/55">
            <form onSubmit={save}>
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 id="editar-lote-titulo" className="text-lg font-bold">Editar lote y vencimiento</h2>
                    <p className="mt-1 text-sm text-slate-600">{fila.codigo} · {fila.descripcion}</p>
                    <p className="mt-1 text-sm text-slate-500">{fila.cliente_nombre || fila.cliente_ruc || ''}</p>
                    <p className="mt-1 text-xs text-slate-500">Ingreso: {fila._lote_ingreso_id || 'Manual'} · Disponible: {Number(fila._lote_disponible || 0).toFixed(2)}</p>
                </div>
                <fieldset disabled={saving} className="space-y-4 px-5 py-4">
                    <div>
                        <label htmlFor="corregir-numero-lote" className="mb-1 block text-sm font-semibold">Número de lote</label>
                        <input id="corregir-numero-lote" value={numero} onChange={event => setNumero(event.target.value)}
                            required maxLength={100} autoFocus className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                    </div>
                    <div>
                        <label htmlFor="corregir-vencimiento" className="mb-1 block text-sm font-semibold">Fecha de vencimiento</label>
                        <input id="corregir-vencimiento" type="date" value={fecha} min="1900-01-01" max="9999-12-31"
                            onChange={event => setFecha(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                        <p className="mt-1 text-xs text-slate-500">Puede dejarla vacía si el producto no tiene vencimiento.</p>
                    </div>
                    <div>
                        <label htmlFor="corregir-lote-motivo" className="mb-1 block text-sm font-semibold">Motivo de la corrección</label>
                        <textarea id="corregir-lote-motivo" value={motivo} onChange={event => setMotivo(event.target.value)}
                            required minLength={3} maxLength={500} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                    </div>
                    <p className="text-sm text-slate-600">Se corregirán los documentos vinculados. Las cantidades se conservarán y el cambio quedará registrado con su usuario.</p>
                    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                </fieldset>
                <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={saving || !changed || !numero.trim() || motivo.trim().length < 3}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        {saving ? 'Guardando…' : 'Guardar corrección'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
