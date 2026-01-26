import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductoList from './pages/Productos/ProductoList';
import { NotaIngresoForm } from './pages/Ingresos/NotaIngresoForm';
import { ActaRecepcionForm } from './pages/Recepcion/ActaRecepcionForm';
import { NotaSalidaForm } from './pages/Salidas/NotaSalidaForm';
import { Dashboard } from './pages/Dashboard/Dashboard';
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
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;