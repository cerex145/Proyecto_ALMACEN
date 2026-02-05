import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const ClienteListForm = () => {
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        numero_ruc: '',
        razon_social: '',
        persona_contacto: '',
        email: '',
        telefono: '',
        direccion: ''
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            setLoading(true);
            // Simular carga desde API
            const response = await fetch('http://localhost:3000/api/clientes');
            const result = await response.json();
            setClientes(result.data || []);
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
                ? `http://localhost:3000/api/clientes/${editId}`
                : 'http://localhost:3000/api/clientes';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormData({
                    numero_ruc: '',
                    razon_social: '',
                    persona_contacto: '',
                    email: '',
                    telefono: '',
                    direccion: ''
                });
                setEditId(null);
                cargarClientes();
                alert(editId ? 'Cliente actualizado' : 'Cliente creado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cliente) => {
        setFormData({
            numero_ruc: cliente.numero_ruc,
            razon_social: cliente.razon_social,
            persona_contacto: cliente.persona_contacto,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion
        });
        setEditId(cliente.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar cliente?')) return;
        try {
            await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' });
            cargarClientes();
        } catch (error) {
            console.error('Error:', error);
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
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                        <Button type="submit" disabled={loading}>
                            {editId ? 'Actualizar' : 'Crear'} Cliente
                        </Button>
                        {editId && (
                            <Button type="button" variant="secondary" onClick={() => {
                                setEditId(null);
                                setFormData({ numero_ruc: '', razon_social: '', persona_contacto: '', email: '', telefono: '', direccion: '' });
                            }}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Tabla de Clientes */}
            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginTop: 0 }}>Clientes Registrados</h3>
                {loading ? (
                    <p>Cargando...</p>
                ) : clientes.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay clientes registrados</p>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>RUC</TableHeader>
                                <TableHeader>Razón Social</TableHeader>
                                <TableHeader>Contacto</TableHeader>
                                <TableHeader>Email</TableHeader>
                                <TableHeader>Teléfono</TableHeader>
                                <TableHeader>Acciones</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clientes.map(cliente => (
                                <TableRow key={cliente.id}>
                                    <TableCell>{cliente.numero_ruc}</TableCell>
                                    <TableCell>{cliente.razon_social}</TableCell>
                                    <TableCell>{cliente.persona_contacto}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell>{cliente.telefono}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(cliente)}>
                                                Editar
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(cliente.id)}>
                                                Eliminar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};
