#!/bin/bash

# ============================================================================
# Script para cargar datos de prueba en el sistema de almacén
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     CARGA DE DATOS DE PRUEBA - SISTEMA DE ALMACÉN             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuración de MySQL
DB_HOST="localhost"
DB_USER="root"
DB_NAME="almacen_db"

# Ruta del archivo SQL
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/seed_data.sql"

# Verificar si el archivo existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $SQL_FILE"
    exit 1
fi

echo "📁 Archivo SQL: $SQL_FILE"
echo "🗄️  Base de datos: $DB_NAME"
echo "🖥️  Host: $DB_HOST"
echo ""

# Confirmar acción
read -p "⚠️  ADVERTENCIA: Este script eliminará todos los datos existentes. ¿Continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 0
fi

echo ""
echo "🔄 Ejecutando script SQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Ejecutar el script SQL
mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DATOS CARGADOS EXITOSAMENTE"
    echo ""
    echo "📊 Datos disponibles:"
    echo "   • 5 Usuarios (admin, jperez, mlopez, cgarcia, aruiz)"
    echo "   • 8 Clientes (instituciones públicas)"
    echo "   • 15 Productos (5 categorías)"
    echo "   • 5 Notas de Ingreso (3 confirmadas)"
    echo "   • 14 Lotes de productos"
    echo "   • 3 Actas de Recepción"
    echo "   • 5 Notas de Salida (3 entregadas)"
    echo "   • 3 Ajustes de Stock"
    echo "   • Movimientos completos en Kardex"
    echo ""
    echo "🔑 Credenciales:"
    echo "   Usuario: admin   | Password: password123"
    echo "   Usuario: jperez  | Password: password123"
    echo "   Usuario: mlopez  | Password: password123"
    echo ""
    echo "🌐 Inicia el sistema con: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Error al cargar los datos"
    echo "Verifica la conexión a MySQL y las credenciales"
    exit 1
fi
