import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AlertasWidget } from './AlertasWidget';
import { KardexWidget } from './KardexWidget';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

export const Dashboard = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-display mb-2">Panel de Control</h1>
                    <p className="text-slate-500 text-sm">
                        Resumen general y métricas clave del almacén
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link to="/ingresos/nuevo">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
                            <span className="mr-2 text-lg">+</span> Nuevo Ingreso
                        </Button>
                    </Link>
                    <Link to="/salidas/nuevo">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
                            <span className="mr-2 text-lg">↗</span> Nueva Salida
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alertas - Critical Priority */}
                <div className="glass-panel rounded-2xl p-1 shadow-sm">
                    <AlertasWidget />
                </div>

                {/* Recent Movements */}
                <div className="glass-panel rounded-2xl p-1 shadow-sm">
                    <KardexWidget />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 px-1">Accesos Directos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <QuickTile to="/productos" icon="📦" label="Inventario" color="blue" />
                    <QuickTile to="/clientes/registro" icon="👥" label="Clientes" color="indigo" />
                    <QuickTile to="/ingresos/controles" icon="📥" label="Ingresos" color="emerald" />
                    <QuickTile to="/recepcion/acta" icon="📝" label="Recepción" color="teal" />
                    <QuickTile to="/salidas/controles" icon="📤" label="Salidas" color="sky" />
                    <QuickTile to="/alertas" icon="⚠️" label="Alertas" color="rose" />
                    <QuickTile to="/kardex" icon="📊" label="Kardex" color="violet" />
                    <QuickTile to="/reportes" icon="📈" label="Reportes" color="slate" />
                    <QuickTile to="/ajustes" icon="⚙️" label="Ajustes" color="gray" />
                </div>
            </div>
        </div>
    );
};

const QuickTile = ({ to, icon, label, color }) => {
    const colors = {
        blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100',
        indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100',
        emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100',
        teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100',
        sky: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-100',
        rose: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-100',
        violet: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-100',
        slate: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100',
        gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100',
    };

    return (
        <Link to={to} className={`
            flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300
            hover:-translate-y-1 hover:shadow-lg
            ${colors[color] || colors.slate}
        `}>
            <span className="text-3xl mb-3 filter drop-shadow-sm">{icon}</span>
            <span className="font-semibold text-sm tracking-wide">{label}</span>
        </Link>
    );
};
