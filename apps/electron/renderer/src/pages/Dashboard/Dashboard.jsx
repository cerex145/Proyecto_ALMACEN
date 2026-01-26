import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { AlertasWidget } from './AlertasWidget';
import { KardexWidget } from './KardexWidget';

export const Dashboard = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>Panel de Control - Almacén</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--secondary-color)' }}>
                        Resumen general y alertas de sistema
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/ingresos/nuevo"><Button>+ Nuevo Ingreso</Button></Link>
                    <Link to="/salidas/nueva"><Button variant="danger">- Nueva Salida</Button></Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Alertas - Critical Priority */}
                <div style={{ minHeight: '300px' }}>
                    <AlertasWidget />
                </div>

                {/* Recent Movements */}
                <div style={{ minHeight: '300px' }}>
                    <KardexWidget />
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--light-bg)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <h4 style={{ marginTop: 0 }}>Accesos Rápidos</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/productos"><Button variant="secondary">Inventario de Productos</Button></Link>
                    <Link to="/recepcion/nueva"><Button variant="secondary">Recepción de Mercadería</Button></Link>
                </div>
            </div>
        </div>
    );
};
