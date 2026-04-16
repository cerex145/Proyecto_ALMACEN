import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Auth & Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';

// Pages
import InventarioGeneral from './pages/inventory/InventarioGeneral';
import { NotaIngresoForm } from './pages/operations/NotaIngresoForm';
import { ActaRecepcionForm } from './pages/operations/ActaRecepcionForm';
import { NotaSalidaForm } from './pages/operations/NotaSalidaForm';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ClienteListForm } from './pages/crm/ClienteListForm';
import { HistorialIngresosFuncional } from './pages/operations/HistorialIngresosFuncional';
import { HistorialSalidasFuncional } from './pages/operations/HistorialSalidasFuncional';
import { ActasRecepcionFuncional } from './pages/operations/ActasRecepcionFuncional';
import { KardexFuncional } from './pages/inventory/KardexFuncional';
import { AlertasListCompleto } from './pages/Alertas/AlertasListCompleto';
import { AjustesPage } from './pages/admin/AjustesPage';

// Layouts & Components
import NotaSalidaLayout from './components/NotaSalidaLayout';
import { MainLayout } from './components/layout/MainLayout';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><span className="text-blue-500 font-bold text-xl animate-pulse">Cargando Sistema BPA...</span></div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/productos" element={<Navigate to="/ingresos/nuevo" replace />} />
              <Route path="/inventario" element={<InventarioGeneral />} />
              <Route path="/clientes/registro" element={<ClienteListForm />} />

              {/* Operaciones */}
              <Route path="/ingresos/nuevo" element={<NotaIngresoForm />} />
              <Route path="/ingresos/editar/:id" element={<NotaIngresoForm />} />
              <Route path="/ingresos/controles" element={<NotaIngresoForm />} />
              <Route path="/ingresos/historial" element={<HistorialIngresosFuncional />} />

              <Route path="/salidas/nuevo" element={<NotaSalidaForm />} />
              <Route path="/salidas/editar/:id" element={<NotaSalidaForm />} />
              <Route path="/salidas/controles" element={<NotaSalidaLayout />} />
              <Route path="/salidas/historial" element={<HistorialSalidasFuncional />} />

              <Route path="/recepcion/nueva" element={<ActaRecepcionForm />} />
              <Route path="/recepcion/acta" element={<ActasRecepcionFuncional />} />

              {/* Control & Admin */}
              <Route path="/kardex" element={<KardexFuncional />} />
              <Route path="/alertas" element={<AlertasListCompleto />} />
              <Route path="/ajustes" element={<AjustesPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;