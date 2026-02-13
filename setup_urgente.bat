@echo off
echo ========================================
echo CONFIGURACION URGENTE - SISTEMA ALMACEN
echo ========================================
echo.

REM Paso 1: Verificar que existe .env
echo [1/5] Verificando archivo .env...
if exist apps\api\.env (
    echo ✓ Archivo .env encontrado
) else (
    echo X Archivo .env NO encontrado
    echo Creando desde .env.example...
    copy apps\api\.env.example apps\api\.env
    echo.
    echo IMPORTANTE: Edita apps\api\.env con tu password de MySQL
    echo Presiona cualquier tecla cuando hayas editado el archivo...
    pause
)
echo.

REM Paso 2: Crear base de datos
echo [2/5] Creando base de datos...
echo.
echo Ingresa tu password de MySQL cuando se solicite:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES LIKE 'almacen_db';"

if %ERRORLEVEL% EQU 0 (
    echo ✓ Base de datos creada/verificada
) else (
    echo X Error al crear base de datos
    echo Verifica tu password de MySQL
    pause
    exit /b 1
)
echo.

REM Paso 3: Instalar dependencias API
echo [3/5] Instalando dependencias del API...
cd apps\api
call npm install
cd ..\..
echo ✓ Dependencias instaladas
echo.

REM Paso 4: Verificar que el servidor puede iniciar
echo [4/5] Verificando configuracion...
echo Presiona Ctrl+C cuando veas "MySQL Database connected"
echo.
cd apps\api
start /B npm run dev
timeout /t 10
taskkill /F /IM node.exe 2>nul
cd ..\..
echo.

REM Paso 5: Listo para migrar
echo [5/5] Configuracion completada!
echo.
echo ========================================
echo SIGUIENTE PASO: MIGRAR DATOS
echo ========================================
echo.
echo Ejecuta:
echo   cd apps\api\scripts
echo   node migrar_csv_urgente.js
echo.
echo ========================================
pause
