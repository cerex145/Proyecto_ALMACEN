import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesService } from '../../services/clientes.service';
import { API_ORIGIN } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const ClienteListForm = () => {
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        codigo: '',
        numero_ruc: '',
        razon_social: '',
        persona_contacto: '',
        email: '',
        telefono: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        categoria_riesgo: 'Bajo',
        estado: 'Activo'
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const compactHeaderClass = 'px-2 py-2 text-[10px]';
    const compactCellClass = 'px-2 py-2 text-[10px] whitespace-normal';

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const result = await clientesService.listar({ activo: 'true' });
            setClientes(result.data || result || []);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const method = editId ? 'PUT' : 'POST';
            const url = editId
                ? `${API_ORIGIN}/api/clientes/${editId}`
                : `${API_ORIGIN}/api/clientes`;

            const payload = {
                codigo: formData.codigo,
                razon_social: formData.razon_social,
                cuit: formData.numero_ruc,
                direccion: formData.direccion,
                distrito: formData.distrito,
                provincia: formData.provincia,
                departamento: formData.departamento,
                categoria_riesgo: formData.categoria_riesgo,
                estado: formData.estado,
                telefono: formData.telefono,
                email: formData.email
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                const apiError = result.error || 'No se pudo guardar el cliente';
                const lowerError = String(apiError).toLowerCase();
                const message = (lowerError.includes('codigo') || lowerError.includes('cuit') || lowerError.includes('ruc'))
                    ? 'Ya existe un cliente con ese RUC/codigo'
                    : apiError;
                throw new Error(message);
            }

            if (response.ok) {
                setFormData({
                    codigo: '',
                    numero_ruc: '',
                    razon_social: '',
                    persona_contacto: '',
                    email: '',
                    telefono: '',
                    direccion: '',
                    distrito: '',
                    provincia: '',
                    departamento: '',
                    categoria_riesgo: 'Bajo',
                    estado: 'Activo'
                });
                setEditId(null);
                cargarClientes();
                alert(editId ? 'Cliente actualizado' : 'Cliente creado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al guardar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cliente) => {
        setFormData({
            codigo: cliente.codigo || '',
            numero_ruc: cliente.cuit || '',
            razon_social: cliente.razon_social,
            persona_contacto: cliente.persona_contacto || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            distrito: cliente.distrito || '',
            provincia: cliente.provincia || '',
            departamento: cliente.departamento || '',
            categoria_riesgo: cliente.categoria_riesgo || 'Bajo',
            estado: cliente.estado || 'Activo'
        });
        setEditId(cliente.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar cliente?')) return;
        try {
            const response = await fetch(`${API_ORIGIN}/api/clientes/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.error || 'No se pudo eliminar el cliente');
            }
            cargarClientes();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al eliminar cliente');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Gestión de Clientes</h1>

            {/* Formulario */}
            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0 }}>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <Input
                        name="codigo"
                        placeholder="Código de Cliente"
                        value={formData.codigo}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="numero_ruc"
                        placeholder="RUC"
                        value={formData.numero_ruc}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="razon_social"
                        placeholder="Razón Social"
                        value={formData.razon_social}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="persona_contacto"
                        placeholder="Contacto"
                        value={formData.persona_contacto}
                        onChange={handleChange}
                    />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    <Input
                        name="direccion"
                        placeholder="Dirección"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                    <Input
                        name="distrito"
                        placeholder="Distrito"
                        value={formData.distrito}
                        onChange={handleChange}
                    />
                    <Input
                        name="provincia"
                        placeholder="Provincia"
                        value={formData.provincia}
                        onChange={handleChange}
                    />
                    <Input
                        name="departamento"
                        placeholder="Departamento"
                        value={formData.departamento}
                        onChange={handleChange}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--secondary-color)' }}>Categoría de riesgo</label>
                        <select
                            name="categoria_riesgo"
                            value={formData.categoria_riesgo}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                        >
                            <option value="Bajo">Bajo</option>
                            <option value="Alto">Alto</option>
                            <option value="No verificado">No verificado</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--secondary-color)' }}>Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                            <option value="Potencial">Potencial</option>
                            <option value="Blokeado">Bloqueado</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                        <Button type="submit" disabled={loading}>
                            {editId ? 'Actualizar' : 'Crear'} Cliente
                        </Button>
                        {editId && (
                            <Button type="button" variant="secondary" onClick={() => {
                                setEditId(null);
                                setFormData({ codigo: '', numero_ruc: '', razon_social: '', persona_contacto: '', email: '', telefono: '', direccion: '', distrito: '', provincia: '', departamento: '', categoria_riesgo: 'Bajo', estado: 'Activo' });
                            }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Tabla de Clientes */}
            <div style={{ background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0 }}>Clientes Registrados</h3>
                {loading ? (
                    <p>Cargando...</p>
                ) : clientes.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay clientes registrados</p>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {clientes.map(cliente => (
                            <div
                                key={cliente.id}
                                style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    padding: '0.75rem',
                                    background: 'white',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem 1rem', fontSize: '12px' }}>
                                    <div><strong>Código Cliente:</strong> {cliente.codigo || '-'}</div>
                                    <div><strong>RUC:</strong> {cliente.cuit || '-'}</div>
                                    <div><strong>Razón Social:</strong> {cliente.razon_social || '-'}</div>
                                    <div><strong>Dirección:</strong> {cliente.direccion || '-'}</div>
                                    <div><strong>Distrito:</strong> {cliente.distrito || '-'}</div>
                                    <div><strong>Provincia:</strong> {cliente.provincia || '-'}</div>
                                    <div><strong>Departamento:</strong> {cliente.departamento || '-'}</div>
                                    <div><strong>Teléfono:</strong> {cliente.telefono || '-'}</div>
                                    <div><strong>Email:</strong> {cliente.email || '-'}</div>
                                    <div><strong>Contacto Principal:</strong> {cliente.persona_contacto || '-'}</div>
                                    <div><strong>Cate. Riesgo:</strong> {cliente.categoria_riesgo || '-'}</div>
                                    <div><strong>Fecha de Registro:</strong> {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '-'}</div>
                                    <div><strong>Estado:</strong> {cliente.estado || '-'}</div>
                                </div>
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(cliente)}>
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(cliente.id)}>
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
