import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

export const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newUser, setNewUser] = useState({ nombre: '', usuario: '', email: '', password: '', rol_id: 1 });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await authService.createUser(newUser);
            setIsCreating(false);
            setNewUser({ nombre: '', usuario: '', email: '', password: '', rol_id: 1 });
            loadUsers();
        } catch (error) {
            alert('Error al crear usuario');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro de eliminar este usuario?')) return;
        try {
            await authService.deleteUser(id);
            loadUsers();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
                    <p className="text-slate-500">Administración de accesos del sistema</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancelar' : '+ Nuevo Usuario'}
                </Button>
            </div>

            {isCreating && (
                <Card className="animate-in slide-in-from-top-4 border-blue-200 bg-blue-50/50">
                    <CardHeader><CardTitle>Nuevo Usuario</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nombre Completo" value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} required />
                            <Input label="Usuario (Login)" value={newUser.usuario} onChange={e => setNewUser({ ...newUser, usuario: e.target.value })} required />
                            <Input label="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            <Input label="Contraseña" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                            <div className="col-span-2">
                                <Button type="submit" variant="primary">Guardar Usuario</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-hidden rounded-xl">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Nombre</TableHeader>
                                    <TableHeader>Usuario</TableHeader>
                                    <TableHeader>Rol</TableHeader>
                                    <TableHeader>Estado</TableHeader>
                                    <TableHeader>Acciones</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map(u => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.nombre}</TableCell>
                                        <TableCell>{u.usuario}</TableCell>
                                        <TableCell><Badge variant="info">{u.rol || 'Admin'}</Badge></TableCell>
                                        <TableCell><Badge variant={u.activo ? 'activo' : 'inactivo'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                                        <TableCell>
                                            {u.id !== currentUser?.id && (
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>Eliminar</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
