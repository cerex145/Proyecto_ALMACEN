@echo off
echo ========================================
echo DETECTANDO CONFIGURACION DE MYSQL
echo ========================================
echo.

echo Probando conexion sin password...
mysql -u root -e "SELECT 'OK' as status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL NO tiene password
    echo.
    echo Configurando .env sin password...
    powershell -Command "(Get-Content apps\api\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=' | Set-Content apps\api\.env"
    echo ✓ Configurado
    goto :test_connection
)

echo X MySQL requiere password
echo.
echo Probando passwords comunes...

echo Probando password: root
mysql -u root -proot -e "SELECT 'OK' as status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Password es: root
    powershell -Command "(Get-Content apps\api\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=root' | Set-Content apps\api\.env"
    goto :test_connection
)

echo Probando password: admin
mysql -u root -padmin -e "SELECT 'OK' as status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Password es: admin
    powershell -Command "(Get-Content apps\api\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=admin' | Set-Content apps\api\.env"
    goto :test_connection
)

echo Probando password: 123456
mysql -u root -p123456 -e "SELECT 'OK' as status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Password es: 123456
    powershell -Command "(Get-Content apps\api\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=123456' | Set-Content apps\api\.env"
    goto :test_connection
)

echo.
echo ========================================
echo NO SE PUDO DETECTAR EL PASSWORD
echo ========================================
echo.
echo Por favor ingresa tu password de MySQL manualmente:
set /p MYSQL_PASS="Password de MySQL: "
echo.
echo Probando password ingresado...
mysql -u root -p%MYSQL_PASS% -e "SELECT 'OK' as status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Password correcto!
    powershell -Command "(Get-Content apps\api\.env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASS%' | Set-Content apps\api\.env"
    goto :test_connection
) else (
    echo X Password incorrecto
    pause
    exit /b 1
)

:test_connection
echo.
echo ========================================
echo CREANDO BASE DE DATOS
echo ========================================
mysql -u root -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES LIKE 'almacen_db';"
echo.
echo ✓ Base de datos lista
echo.
echo ========================================
echo CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes ejecutar:
echo   cd apps\api
echo   npm run dev
echo.
pause
