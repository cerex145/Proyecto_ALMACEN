import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarios.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const UsuariosListCompleto = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState({ rol_id: '', activo: 'true' });
    const [showFormulario, setShowFormulario] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        email: '',
        password: '',
        rol_id: ''
    });

    useEffect(() => {
        cargarUsuarios();
        cargarRoles();
    }, [filtro]);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await usuariosService.listar(filtro);
            setUsuarios(response.data || []);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarRoles = async () => {
        try {
            const response = await usuariosService.listarRoles();
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error al cargar roles:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await usuariosService.registrar(formData);
            alert('✅ Usuario creado exitosamente');
            setFormData({ nombre: '', usuario: '', email: '', password: '', rol_id: '' });
            setShowFormulario(false);
            cargarUsuarios();
        } catch (error) {
            alert('❌ Error al crear usuario');
            console.error(error);
        }
    };

    const handleDeactivar = async (id) => {
        if (window.confirm('¿Desactiver este usuario?')) {
            try {
                await usuariosService.deactivar(id);
                cargarUsuarios();
                alert('✅ Usuario desactivado');
            } catch (error) {
                alert('❌ Error al desactivar usuario');
                console.error(error);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Gestión de Usuarios</h2>
                <Button onClick={() => setShowFormulario(!showFormulario)}>
                    {showFormulario ? '✕ Cancelar' : '+ Nuevo Usuario'}
                </Button>
            </div>

            {showFormulario && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                }}>
                    <h3>Crear Nuevo Usuario</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        <div>
                            <label>Nombre Completo</label>
                            <Input
                                placeholder="Nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Usuario (Login)</label>
                            <Input
                                placeholder="usuario123"
                                value={formData.usuario}
                                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <Input
                                type="email"
                                placeholder="usuario@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Rol</label>
                            <select
                                value={formData.rol_id}
                                onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                                required
                            >
                                <option value="">-- Seleccionar Rol --</option>
                                {roles.map(rol => (
                                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Contraseña</label>
                            <Input
                                type="password"
                                placeholder="Contraseña segura"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button type="submit">Crear Usuario</Button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <select
                    value={filtro.rol_id}
                    onChange={(e) => setFiltro({ ...filtro, rol_id: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos los roles</option>
                    {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                    ))}
                </select>
                <select
                    value={filtro.activo}
                    onChange={(e) => setFiltro({ ...filtro, activo: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                </select>
                <Button onClick={cargarUsuarios}>Actualizar</Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Usuario</TableHeader>
                            <TableHeader>Nombre</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Rol</TableHeader>
                            <TableHeader>Último Acceso</TableHeader>
                            <TableHeader>Estado</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.length > 0 ? (
                            usuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell>{usuario.usuario}</TableCell>
                                    <TableCell>{usuario.nombre}</TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>{usuario.rol?.nombre || 'N/A'}</TableCell>
                                    <TableCell>
                                        {usuario.ultimo_acceso
                                            ? new Date(usuario.ultimo_acceso).toLocaleDateString()
                                            : 'Nunca'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={usuario.activo ? 'success' : 'danger'}>
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {usuario.activo && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDeactivar(usuario.id)}
                                            >
                                                Desactivar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="7" style={{ textAlign: 'center' }}>
                                    No hay usuarios
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
