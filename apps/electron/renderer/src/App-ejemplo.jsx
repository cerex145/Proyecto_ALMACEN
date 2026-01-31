import React, { useState, useEffect } from 'react';
import './App.css';

// Componentes de página
import { NotaIngresoList } from './pages/Ingresos/NotaIngresoList';
import { NotaIngresoForm } from './pages/Ingresos/NotaIngresoFormCompleto';
import { ActaRecepcionList } from './pages/Recepcion/ActaRecepcionList';
import { ActaRecepcionForm } from './pages/Recepcion/ActaRecepcionForm';
import { NotaSalidaList } from './pages/Salidas/NotaSalidaList';
import { NotaSalidaForm } from './pages/Salidas/NotaSalidaFormCompleto';
import { KardexListCompleto } from './pages/Kardex/KardexListCompleto';
import { AlertasListCompleto } from './pages/Alertas/AlertasListCompleto';
import { UsuariosListCompleto } from './pages/Usuarios/UsuariosListCompleto';
import { ReportesCompleto } from './pages/Reportes/ReportesCompleto';

function App() {
    const [seccionActual, setSeccionActual] = useState('dashboard');
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [subSeccion, setSubSeccion] = useState('lista');

    useEffect(() => {
        // Verificar si hay token y usuario activo
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        if (token && usuario) {
            setUsuarioActual(JSON.parse(usuario));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuarioActual(null);
        setSeccionActual('login');
    };

    const renderSeccion = () => {
        if (!usuarioActual) {
            return <div style={{ padding: '20px' }}>Por favor inicia sesión primero</div>;
        }

        switch (seccionActual) {
            // DASHBOARD
            case 'dashboard':
                return (
                    <div style={{ padding: '20px' }}>
                        <h1>📊 Dashboard - Sistema de Almacén</h1>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px',
                            marginTop: '20px'
                        }}>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#e3f2fd'
                            }}>
                                <h3>📥 Ingresos</h3>
                                <p>Registra entrada de mercadería</p>
                                <button
                                    onClick={() => setSeccionActual('ingresos')}
                                    style={{ padding: '8px 15px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Ingresos
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#f3e5f5'
                            }}>
                                <h3>📋 Actas Recepción</h3>
                                <p>Registra conformidad de entrada</p>
                                <button
                                    onClick={() => setSeccionActual('actas')}
                                    style={{ padding: '8px 15px', backgroundColor: '#7b1fa2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Actas
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#e8f5e9'
                            }}>
                                <h3>📦 Salidas</h3>
                                <p>Registra salida a clientes</p>
                                <button
                                    onClick={() => setSeccionActual('salidas')}
                                    style={{ padding: '8px 15px', backgroundColor: '#388e3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Salidas
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#fff3e0'
                            }}>
                                <h3>📊 Kardex</h3>
                                <p>Visualiza movimientos históricos</p>
                                <button
                                    onClick={() => setSeccionActual('kardex')}
                                    style={{ padding: '8px 15px', backgroundColor: '#f57c00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Kardex
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#ffebee'
                            }}>
                                <h3>⚠️ Alertas</h3>
                                <p>Monitorea vencimientos</p>
                                <button
                                    onClick={() => setSeccionActual('alertas')}
                                    style={{ padding: '8px 15px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Alertas
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#eceff1'
                            }}>
                                <h3>👥 Usuarios</h3>
                                <p>Gestiona acceso al sistema</p>
                                <button
                                    onClick={() => setSeccionActual('usuarios')}
                                    style={{ padding: '8px 15px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Usuarios
                                </button>
                            </div>
                            <div style={{
                                padding: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#e0f2f1'
                            }}>
                                <h3>📈 Reportes</h3>
                                <p>Analiza datos del almacén</p>
                                <button
                                    onClick={() => setSeccionActual('reportes')}
                                    style={{ padding: '8px 15px', backgroundColor: '#00796b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Ir a Reportes
                                </button>
                            </div>
                        </div>
                    </div>
                );

            // INGRESOS
            case 'ingresos':
                return (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setSubSeccion('lista')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'lista' ? '#1976d2' : '#ddd',
                                    color: subSeccion === 'lista' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Lista de Ingresos
                            </button>
                            <button
                                onClick={() => setSubSeccion('formulario')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'formulario' ? '#1976d2' : '#ddd',
                                    color: subSeccion === 'formulario' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Nuevo Ingreso
                            </button>
                        </div>
                        {subSeccion === 'lista' ? <NotaIngresoList /> : <NotaIngresoForm />}
                    </>
                );

            // ACTAS
            case 'actas':
                return (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setSubSeccion('lista')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'lista' ? '#7b1fa2' : '#ddd',
                                    color: subSeccion === 'lista' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Lista de Actas
                            </button>
                            <button
                                onClick={() => setSubSeccion('formulario')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'formulario' ? '#7b1fa2' : '#ddd',
                                    color: subSeccion === 'formulario' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Nueva Acta
                            </button>
                        </div>
                        {subSeccion === 'lista' ? <ActaRecepcionList /> : <ActaRecepcionForm />}
                    </>
                );

            // SALIDAS
            case 'salidas':
                return (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setSubSeccion('lista')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'lista' ? '#388e3c' : '#ddd',
                                    color: subSeccion === 'lista' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Lista de Salidas
                            </button>
                            <button
                                onClick={() => setSubSeccion('formulario')}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: subSeccion === 'formulario' ? '#388e3c' : '#ddd',
                                    color: subSeccion === 'formulario' ? 'white' : 'black',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Nueva Salida
                            </button>
                        </div>
                        {subSeccion === 'lista' ? <NotaSalidaList /> : <NotaSalidaForm />}
                    </>
                );

            // KARDEX
            case 'kardex':
                return <KardexListCompleto />;

            // ALERTAS
            case 'alertas':
                return <AlertasListCompleto />;

            // USUARIOS
            case 'usuarios':
                return <UsuariosListCompleto />;

            // REPORTES
            case 'reportes':
                return <ReportesCompleto />;

            default:
                return <div>Sección no encontrada</div>;
        }
    };

    return (
        <div className="app">
            {/* BARRA DE NAVEGACIÓN */}
            <nav style={{
                backgroundColor: '#1a237e',
                color: 'white',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0 }}>📦 Sistema de Almacén</h2>
                    {usuarioActual && <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>Usuario: {usuarioActual.usuario}</p>}
                </div>
                {usuarioActual && (
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#ff6f00',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                )}
            </nav>

            {/* MENÚ LATERAL */}
            {usuarioActual && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr',
                    minHeight: 'calc(100vh - 100px)'
                }}>
                    <aside style={{
                        backgroundColor: '#f5f5f5',
                        padding: '15px',
                        borderRight: '1px solid #ddd'
                    }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => { setSeccionActual('dashboard'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'dashboard' ? '#1976d2' : 'white',
                                    color: seccionActual === 'dashboard' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📊 Dashboard
                            </button>
                            <button
                                onClick={() => { setSeccionActual('ingresos'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'ingresos' ? '#1976d2' : 'white',
                                    color: seccionActual === 'ingresos' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📥 Ingresos
                            </button>
                            <button
                                onClick={() => { setSeccionActual('actas'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'actas' ? '#1976d2' : 'white',
                                    color: seccionActual === 'actas' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📋 Actas
                            </button>
                            <button
                                onClick={() => { setSeccionActual('salidas'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'salidas' ? '#1976d2' : 'white',
                                    color: seccionActual === 'salidas' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📦 Salidas
                            </button>
                            <button
                                onClick={() => { setSeccionActual('kardex'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'kardex' ? '#1976d2' : 'white',
                                    color: seccionActual === 'kardex' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📊 Kardex
                            </button>
                            <button
                                onClick={() => { setSeccionActual('alertas'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'alertas' ? '#1976d2' : 'white',
                                    color: seccionActual === 'alertas' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                ⚠️ Alertas
                            </button>
                            <button
                                onClick={() => { setSeccionActual('usuarios'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'usuarios' ? '#1976d2' : 'white',
                                    color: seccionActual === 'usuarios' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                👥 Usuarios
                            </button>
                            <button
                                onClick={() => { setSeccionActual('reportes'); setSubSeccion('lista'); }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: seccionActual === 'reportes' ? '#1976d2' : 'white',
                                    color: seccionActual === 'reportes' ? 'white' : 'black',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                📈 Reportes
                            </button>
                        </nav>
                    </aside>

                    {/* CONTENIDO PRINCIPAL */}
                    <main style={{ overflowY: 'auto' }}>
                        {renderSeccion()}
                    </main>
                </div>
            )}

            {/* PIE DE PÁGINA */}
            <footer style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                textAlign: 'center',
                borderTop: '1px solid #ddd',
                fontSize: '0.9em',
                color: '#666'
            }}>
                <p>Sistema de Gestión de Almacén v1.0 • Última actualización: 30/01/2026</p>
            </footer>
        </div>
    );
}

export default App;
