import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import ProductoList from './pages/inventory/ProductoList';
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
import { ReportsPage } from './pages/reports/ReportsPage';
import { AjustesPage } from './pages/admin/AjustesPage';

// Layouts & Components
import NotaSalidaLayout from './components/NotaSalidaLayout';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<ProductoList />} />
          <Route path="/clientes/registro" element={<ClienteListForm />} />

          {/* Operaciones */}
          <Route path="/ingresos/nuevo" element={<NotaIngresoForm />} />
          <Route path="/ingresos/controles" element={<NotaIngresoForm />} />
          <Route path="/ingresos/historial" element={<HistorialIngresosFuncional />} />

          <Route path="/salidas/nuevo" element={<NotaSalidaForm />} />
          <Route path="/salidas/controles" element={<NotaSalidaLayout />} />
          <Route path="/salidas/historial" element={<HistorialSalidasFuncional />} />

          <Route path="/recepcion/nueva" element={<ActaRecepcionForm />} />
          <Route path="/recepcion/acta" element={<ActasRecepcionFuncional />} />

          {/* Control & Admin */}
          <Route path="/kardex" element={<KardexFuncional />} />
          <Route path="/alertas" element={<AlertasListCompleto />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/ajustes" element={<AjustesPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;