const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let fastifyServer;

// Iniciar servidor Fastify
function startFastifyServer() {
    const isDev = !app.isPackaged;
    const apiPath = isDev
        ? path.join(__dirname, '../../../api/src/server.js')
        : path.join(process.resourcesPath, 'api/server.js');

    console.log('🔧 Iniciando Fastify desde:', apiPath);

    fastifyServer = spawn('node', [apiPath], {
        env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' }
    });

    fastifyServer.stdout.on('data', (data) => {
        console.log(`[Fastify]: ${data}`);
    });

    fastifyServer.stderr.on('data', (data) => {
        console.error(`[Fastify Error]: ${data}`);
    });

    fastifyServer.on('error', (error) => {
        console.error('❌ Error al iniciar Fastify:', error);
    });
}

// Crear ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    // En desarrollo: cargar desde Vite
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // En producción: cargar desde build
        mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Cuando Electron está listo
app.whenReady().then(() => {
    // En desarrollo, el servidor API se inicia externamente (npm run dev:api)
    if (app.isPackaged) {
        startFastifyServer();
    }

    // Esperar 2 segundos para que Fastify inicie
    setTimeout(createWindow, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Cerrar todo al salir
app.on('window-all-closed', () => {
    if (fastifyServer) {
        console.log('🛑 Cerrando servidor Fastify...');
        fastifyServer.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (fastifyServer) {
        fastifyServer.kill();
    }
});