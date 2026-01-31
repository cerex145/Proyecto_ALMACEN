import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductoList from './pages/Productos/ProductoList';
import { NotaIngresoForm } from './pages/Ingresos/NotaIngresoForm';
import { ActaRecepcionForm } from './pages/Recepcion/ActaRecepcionForm';
import { NotaSalidaForm } from './pages/Salidas/NotaSalidaForm';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ClienteListForm } from './pages/Clientes/ClienteListForm';
import { HistorialIngresosFuncional } from './pages/Ingresos/HistorialIngresosFuncional';
import { HistorialSalidasFuncional } from './pages/Salidas/HistorialSalidasFuncional';
import { ActasRecepcionFuncional } from './pages/Recepcion/ActasRecepcionFuncional';
import { KardexFuncional } from './pages/Kardex/KardexFuncional';
import NotaIngresoLayout from './components/NotaIngresoLayout';
import NotaSalidaLayout from './components/NotaSalidaLayout';
import AjustesLayout from './components/AjustesLayout';
import './App.css';

function App() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Detectar si está corriendo en Electron
    setIsElectron(!!window.electronAPI);
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<ProductoList />} />
            <Route path="/ingresos/nuevo" element={<NotaIngresoForm />} />
            <Route path="/recepcion/nueva" element={<ActaRecepcionForm />} />
            <Route path="/salidas/nueva" element={<NotaSalidaForm />} />
            <Route path="/clientes/registro" element={<ClienteListForm />} />
            <Route path="/ingresos/controles" element={<NotaIngresoLayout />} />
            <Route path="/salidas/controles" element={<NotaSalidaLayout />} />
            <Route path="/ingresos/historial" element={<HistorialIngresosFuncional />} />
            <Route path="/salidas/historial" element={<HistorialSalidasFuncional />} />
            <Route path="/recepcion/acta" element={<ActasRecepcionFuncional />} />
            <Route path="/kardex" element={<KardexFuncional />} />
            <Route path="/ajustes" element={<AjustesLayout />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;