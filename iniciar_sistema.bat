@echo off
echo ========================================
echo LIMPIANDO PROCESOS Y REINICIANDO
echo ========================================
echo.

echo Deteniendo todos los procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Deteniendo todos los procesos de Electron...
taskkill /F /IM electron.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ✓ Procesos detenidos
echo.
echo ========================================
echo INICIANDO SISTEMA COMPLETO
echo ========================================
echo.

echo Iniciando Backend API (Puerto 3000)...
start "Backend API" cmd /k "cd apps\api && npm run dev"
timeout /t 3 /nobreak >nul

echo Iniciando Frontend React (Puerto 5173)...
start "Frontend React" cmd /k "cd apps\electron\renderer && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo SISTEMA INICIADO
echo ========================================
echo.
echo ✓ Backend API:      http://localhost:3000
echo ✓ Frontend React:   http://localhost:5173
echo ✓ Swagger UI:       http://localhost:3000/docs
echo.
echo Abre tu navegador en: http://localhost:5173
echo.
echo Para iniciar Electron (opcional):
echo   cd apps\electron
echo   npm run dev
echo.
pause
