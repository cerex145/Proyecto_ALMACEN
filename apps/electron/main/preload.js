const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Verificar si está en Electron
    isElectron: () => true,

    // Operaciones de archivos Excel (implementar después)
    importExcel: (type, filePath) =>
        ipcRenderer.invoke('import-excel', type, filePath),

    exportKardex: (filters) =>
        ipcRenderer.invoke('export-kardex', filters),

    selectFile: (options) =>
        ipcRenderer.invoke('select-file', options),

    // Notificaciones
    showNotification: (title, body) =>
        ipcRenderer.send('show-notification', { title, body }),

    // Escuchar eventos
    onAlertUpdate: (callback) => {
        ipcRenderer.on('alert-update', (event, data) => callback(data));
    }
});

console.log('✅ Preload script cargado');