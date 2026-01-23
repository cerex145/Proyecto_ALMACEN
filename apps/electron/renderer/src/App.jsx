import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Detectar si está corriendo en Electron
    setIsElectron(!!window.electronAPI);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gestión de Almacén</h1>
        <p>
          {isElectron ? '🖥️ Ejecutando en Electron' : '🌐 Ejecutando en navegador'}
        </p>
        <div className="info-box">
          <h2>Estado del Sistema</h2>
          <ul>
            <li>✅ React funcionando</li>
            <li>✅ Vite configurado</li>
            <li>⏳ Esperando Electron...</li>
            <li>⏳ Esperando API Fastify...</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;