import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Auth & Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';

import { MainLayout } from './components/layout/MainLayout';

const InventarioGeneral = lazy(() => import('./pages/inventory/InventarioGeneral'));
const NotaIngresoForm = lazy(() => import('./pages/operations/NotaIngresoForm').then(m => ({ default: m.NotaIngresoForm })));
const ActaRecepcionForm = lazy(() => import('./pages/operations/ActaRecepcionForm').then(m => ({ default: m.ActaRecepcionForm })));
const NotaSalidaForm = lazy(() => import('./pages/operations/NotaSalidaForm').then(m => ({ default: m.NotaSalidaForm })));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const ClienteListForm = lazy(() => import('./pages/crm/ClienteListForm').then(m => ({ default: m.ClienteListForm })));
const HistorialIngresosFuncional = lazy(() => import('./pages/operations/HistorialIngresosFuncional').then(m => ({ default: m.HistorialIngresosFuncional })));
const HistorialSalidasFuncional = lazy(() => import('./pages/operations/HistorialSalidasFuncional').then(m => ({ default: m.HistorialSalidasFuncional })));
const ActasRecepcionFuncional = lazy(() => import('./pages/operations/ActasRecepcionFuncional').then(m => ({ default: m.ActasRecepcionFuncional })));
const KardexFuncional = lazy(() => import('./pages/inventory/KardexFuncional').then(m => ({ default: m.KardexFuncional })));
const AlertasListCompleto = lazy(() => import('./pages/Alertas/AlertasListCompleto').then(m => ({ default: m.AlertasListCompleto })));
const AjustesPage = lazy(() => import('./pages/admin/AjustesPage').then(m => ({ default: m.AjustesPage })));
const NotaSalidaLayout = lazy(() => import('./components/NotaSalidaLayout'));

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><span className="text-blue-500 font-bold text-xl animate-pulse">Cargando Sistema BPA...</span></div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <MainLayout>
            <Suspense fallback={<p role="status" className="p-6 text-slate-500">Cargando módulo…</p>}>
                <Outlet />
            </Suspense>
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
