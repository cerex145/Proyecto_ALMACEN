import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export const ActaRecepcionForm = () => {
    const [ingresos, setIngresos] = useState([]);
    const [selectedIngreso, setSelectedIngreso] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

    // We use field array to manage the dynamic list of items to receive
    const { fields, replace } = useFieldArray({
        control,
        name: "detalles"
    });

    useEffect(() => {
        loadIngresosPendientes();
    }, []);

    const loadIngresosPendientes = async () => {
        try {
            // In a real app we would filter by ?estado=registrado
            const data = await operationService.getIngresos();
            // Mock filter for now if backend doesn't support it yet
            setIngresos(data.filter(i => i.estado === 'registrado'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectIngreso = async (e) => {
        const ingresoId = e.target.value;
        if (!ingresoId) {
            setSelectedIngreso(null);
            replace([]);
            return;
        }

        try {
            setLoadingDetails(true);
            const ingreso = await operationService.getIngresoById(ingresoId);
            setSelectedIngreso(ingreso);

            // Populate the form with items from the Ingreso
            // We assume backend returns 'detalles' in the ingreso object
            const items = ingreso.detalles || [];
            replace(items.map(item => ({
                producto_id: item.producto_id,
                producto_nombre: item.producto?.descripcion || `Producto ${item.producto_id}`,
                cantidad_esperada: item.cantidad,
                cantidad_recibida: item.cantidad, // Default to full reception
                numero_lote: '',
                fecha_vencimiento: ''
            })));

            setValue('ingreso_id', ingresoId);
        } catch (error) {
            console.error(error);
            alert('Error al cargar detalles del ingreso');
        } finally {
            setLoadingDetails(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const payload = { ...data, responsable_recepcion_id: 1 }; // Mock ID
            await operationService.createActaRecepcion(payload);
            alert('Acta de Recepción registrada. Stock actualizado.');
            reset();
            setSelectedIngreso(null);
            loadIngresosPendientes();
        } catch (error) {
            console.error(error);
            alert('Error al registrar recepción');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Recepción de Mercadería (Conformidad)</h2>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Seleccionar Nota de Ingreso Pendiente</label>
                <select
                    onChange={handleSelectIngreso}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                >
                    <option value="">-- Seleccione Ingreso --</option>
                    {ingresos.map(ing => (
                        <option key={ing.id} value={ing.id}>
                            {ing.numero_ingreso} - {ing.proveedor?.razon_social || 'Proveedor'} ({new Date(ing.fecha).toLocaleDateString()})
                        </option>
                    ))}
                </select>
            </div>

            {selectedIngreso && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Número de Acta"
                                register={register('numero_acta', { required: 'Requerido' })}
                                error={errors.numero_acta}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Fecha Recepción"
                                type="date"
                                register={register('fecha_recepcion', { required: 'Requerido' })}
                                error={errors.fecha_recepcion}
                            />
                        </div>
                    </div>

                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detalle de Recepción (Asignación de Lotes)</h4>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Producto</TableHeader>
                                <TableHeader>Cant. Solicitada</TableHeader>
                                <TableHeader>Cant. Recibida</TableHeader>
                                <TableHeader>Lote (Obligatorio)</TableHeader>
                                <TableHeader>Vencimiento (Obligatorio)</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.producto_nombre}</TableCell>
                                    <TableCell>{field.cantidad_esperada}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            register={register(`detalles.${index}.cantidad_recibida`, { required: true })}
                                            style={{ marginBottom: 0 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Lote #..."
                                            register={register(`detalles.${index}.numero_lote`, { required: 'Lote requerido' })}
                                            style={{ marginBottom: 0 }}
                                            error={errors.detalles?.[index]?.numero_lote}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="date"
                                            register={register(`detalles.${index}.fecha_vencimiento`, { required: 'Vencimiento requerido' })}
                                            style={{ marginBottom: 0 }}
                                            error={errors.detalles?.[index]?.fecha_vencimiento}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="button" variant="secondary" onClick={() => setSelectedIngreso(null)}>Cancelar</Button>
                        <Button type="submit" isLoading={isSubmitting}>Confirmar Recepción e Ingresar Stock</Button>
                    </div>
                </form>
            )}
        </div>
    );
};
