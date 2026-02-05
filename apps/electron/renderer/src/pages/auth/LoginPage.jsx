import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ usuario: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.usuario, formData.password);
            navigate('/');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <Card className="shadow-2xl border-white/50 backdrop-blur-xl bg-white/80">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                            <span className="text-3xl">📦</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Sistema BPA</CardTitle>
                        <p className="text-slate-500 text-sm">Ingreso seguro al sistema</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Usuario"
                                placeholder="Ej: admin"
                                value={formData.usuario}
                                onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                                autoFocus
                            />
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base shadow-lg shadow-blue-500/20"
                                disabled={loading}
                            >
                                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </CardContent>
                    <div className="p-4 text-center border-t border-slate-100 text-xs text-slate-400">
                        Sistema de Gestión de Almacén v1.0
                    </div>
                </Card>
            </div>
        </div>
    );
};
