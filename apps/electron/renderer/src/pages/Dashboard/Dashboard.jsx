import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AlertasWidget } from './AlertasWidget';
import { KardexWidget } from './KardexWidget';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const QuickLink = ({ to, label, color = 'bg-slate-100 hover:bg-slate-200 text-slate-700' }) => (
    <Link to={to} className={`
        flex items-center justify-center p-4 rounded-xl font-medium transition-all duration-200 text-center
        ${color}
    `}>
        {label}
    </Link>
);

export const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 mt-1">
                        Resumen general y estado del almacén
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/ingresos/nuevo">
                        <Button variant="primary" size="lg" className="shadow-lg shadow-blue-500/30">
                            + Nuevo Ingreso
                        </Button>
                    </Link>
                    <Link to="/salidas/nueva">
                        <Button variant="danger" size="lg" className="shadow-lg shadow-rose-500/30">
                            - Nueva Salida
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertas - Critical Priority */}
                <div className="min-h-[300px]">
                    <AlertasWidget />
                </div>

                {/* Recent Movements */}
                <div className="min-h-[300px]">
                    <KardexWidget />
                </div>
            </div>

            <Card className="bg-slate-50/50 border-dashed">
                <CardHeader className="mb-4">
                    <CardTitle className="text-slate-600">⚡ Accesos Rápidos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <QuickLink to="/productos" label="Inventario" color="bg-blue-50 hover:bg-blue-100 text-blue-700" />
                        <QuickLink to="/recepcion/nueva" label="Recepción" color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700" />
                        <QuickLink to="/clientes/registro" label="Clientes" />
                        <QuickLink to="/ingresos/controles" label="Control Ingresos" />
                        <QuickLink to="/salidas/controles" label="Control Salidas" />
                        <QuickLink to="/ingresos/historial" label="Historial Ingresos" />
                        <QuickLink to="/salidas/historial" label="Historial Salidas" />
                        <QuickLink to="/recepcion/acta" label="Actas Recepción" />
                        <QuickLink to="/kardex" label="Kardex Completo" />
                        <QuickLink to="/ajustes" label="Ajustes" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
