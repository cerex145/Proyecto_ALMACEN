#!/bin/bash

# 🚀 SCRIPTS DE INICIO RÁPIDO - SISTEMA DE ALMACÉN

echo "╔════════════════════════════════════════════════════╗"
echo "║   SISTEMA DE GESTIÓN DE ALMACÉN v1.0              ║"
echo "║         Scripts de Inicio Rápido                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
else
    OS="windows"
fi

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. PREPARAR BASE DE DATOS
# ============================================
setup_db() {
    echo -e "${BLUE}🗄️  Preparando Base de Datos...${NC}"
    
    echo "Ingresa usuario de MySQL (default: root):"
    read -p "Usuario: " DB_USER
    DB_USER=${DB_USER:-root}
    
    read -s -p "Contraseña: " DB_PASS
    echo ""
    
    echo "Creando base de datos..."
    mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    echo "Ejecutando migraciones..."
    mysql -u "$DB_USER" -p"$DB_PASS" almacen_db < apps/api/migrations/002_create_complete_schema.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base de datos configurada exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al configurar la base de datos${NC}"
        exit 1
    fi
}

# ============================================
# 2. INSTALAR DEPENDENCIAS
# ============================================
install_deps() {
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    
    echo "Backend..."
    cd apps/api
    npm install
    cd ../..
    
    echo "Frontend..."
    cd apps/electron/renderer
    npm install
    cd ../../..
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    else
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
}

# ============================================
# 3. INICIAR API
# ============================================
start_api() {
    echo -e "${BLUE}🚀 Iniciando API...${NC}"
    cd apps/api
    npm run dev
}

# ============================================
# 4. INICIAR ELECTRON
# ============================================
start_electron() {
    echo -e "${BLUE}🚀 Iniciando Electron (Frontend)...${NC}"
    cd apps/electron
    npm run dev
}

# ============================================
# 5. INICIAR TODO (Terminal en background)
# ============================================
start_all() {
    echo -e "${BLUE}🚀 Iniciando sistema completo...${NC}"
    
    if [[ "$OS" == "windows" ]]; then
        # En Windows, abrir en nuevas ventanas cmd
        start cmd /k "cd apps/api && npm run dev"
        start cmd /k "cd apps/electron && npm run dev"
    else
        # En macOS/Linux, usar tmux si está disponible
        if command -v tmux &> /dev/null; then
            tmux new-session -d -s almacen
            tmux new-window -t almacen -n api "cd apps/api && npm run dev"
            tmux new-window -t almacen -n electron "cd apps/electron && npm run dev"
            echo -e "${GREEN}✅ Sistema iniciado en sesión tmux 'almacen'${NC}"
            echo "Ver API: tmux attach -t almacen:0"
            echo "Ver Electron: tmux attach -t almacen:1"
        else
            # Sin tmux, iniciar en background
            cd apps/api && npm run dev &
            API_PID=$!
            cd ../electron && npm run dev &
            ELECTRON_PID=$!
            echo -e "${GREEN}✅ Sistema iniciado${NC}"
            echo "API PID: $API_PID"
            echo "Electron PID: $ELECTRON_PID"
        fi
    fi
}

# ============================================
# 6. CREAR USUARIO ADMIN
# ============================================
create_admin() {
    echo -e "${BLUE}👤 Creando usuario administrador...${NC}"
    
    read -p "¿Nombre completo?: " FULL_NAME
    read -p "¿Usuario (login)?: " USERNAME
    read -p "¿Email?: " EMAIL
    read -s -p "¿Contraseña?: " PASSWORD
    echo ""
    
    curl -X POST http://localhost:3000/api/usuarios/registro \
      -H "Content-Type: application/json" \
      -d "{
        \"nombre\": \"$FULL_NAME\",
        \"usuario\": \"$USERNAME\",
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"rol_id\": 1
      }"
    
    echo -e "${GREEN}✅ Usuario creado${NC}"
}

# ============================================
# 7. TEST DE API
# ============================================
test_api() {
    echo -e "${BLUE}🧪 Probando API...${NC}"
    
    echo "Health Check:"
    curl http://localhost:3000/health
    echo ""
    
    echo "Intentando login..."
    curl -X POST http://localhost:3000/api/usuarios/login \
      -H "Content-Type: application/json" \
      -d '{"usuario": "admin", "password": "Admin123!"}'
    echo ""
}

# ============================================
# 8. LIMPIAR DATOS (RESET)
# ============================================
reset_db() {
    echo -e "${RED}⚠️  ADVERTENCIA: Esto borrará todos los datos${NC}"
    read -p "¿Estás seguro? (s/n): " CONFIRM
    
    if [ "$CONFIRM" = "s" ]; then
        read -p "Usuario MySQL: " DB_USER
        DB_USER=${DB_USER:-root}
        read -s -p "Contraseña: " DB_PASS
        echo ""
        
        mysql -u "$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS almacen_db;"
        mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        mysql -u "$DB_USER" -p"$DB_PASS" almacen_db < apps/api/migrations/002_create_complete_schema.sql
        
        echo -e "${GREEN}✅ Base de datos reiniciada${NC}"
    else
        echo "Cancelado"
    fi
}

# ============================================
# 9. VER LOGS
# ============================================
view_logs() {
    echo -e "${BLUE}📋 Historial de logs recientes${NC}"
    
    if [ -f "apps/api/logs/app.log" ]; then
        echo "=== API Logs ==="
        tail -n 20 apps/api/logs/app.log
    fi
    
    echo ""
    echo "Para más detalles, revisa:"
    echo "- API: apps/api/logs/"
    echo "- Frontend: apps/electron/renderer/logs/ (si existen)"
}

# ============================================
# 10. DOCUMENTACIÓN
# ============================================
show_docs() {
    echo -e "${BLUE}📚 Documentación disponible${NC}"
    echo ""
    echo "1. README_RAPIDO.md"
    echo "   → Guía rápida de inicio (recomendado)"
    echo ""
    echo "2. API_DOCUMENTATION.md"
    echo "   → Referencia completa de endpoints"
    echo ""
    echo "3. GUIA_COMPONENTES_FRONTEND.md"
    echo "   → Cómo usar los componentes React"
    echo ""
    echo "4. CHECKLIST_COMPONENTES_FRONTEND.md"
    echo "   → Verificación de implementación"
    echo ""
    echo "5. RESUMEN_FINAL.md"
    echo "   → Estado completo del proyecto"
    echo ""
    echo "Abre cualquiera con:"
    echo "  cat [archivo].md"
    echo "  less [archivo].md"
}

# ============================================
# MENÚ PRINCIPAL
# ============================================
show_menu() {
    echo ""
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo -e "${YELLOW}    SELECCIONA UNA OPCIÓN${NC}"
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo ""
    echo "1) 🗄️  Preparar base de datos"
    echo "2) 📦 Instalar dependencias"
    echo "3) 🚀 Iniciar API (puerto 3000)"
    echo "4) 🚀 Iniciar Electron (Frontend)"
    echo "5) 🚀 Iniciar TODO (API + Frontend)"
    echo ""
    echo "6) 👤 Crear usuario administrador"
    echo "7) 🧪 Test de API"
    echo "8) 🔄 Resetear base de datos"
    echo "9) 📋 Ver logs"
    echo "10) 📚 Ver documentación"
    echo ""
    echo "0) ❌ Salir"
    echo ""
    echo -e "${YELLOW}════════════════════════════════════${NC}"
}

# ============================================
# SCRIPT PRINCIPAL
# ============================================
main() {
    while true; do
        show_menu
        read -p "Opción: " choice
        echo ""
        
        case $choice in
            1) setup_db ;;
            2) install_deps ;;
            3) start_api ;;
            4) start_electron ;;
            5) start_all ;;
            6) create_admin ;;
            7) test_api ;;
            8) reset_db ;;
            9) view_logs ;;
            10) show_docs ;;
            0) echo -e "${GREEN}Hasta luego!${NC}"; exit 0 ;;
            *) echo -e "${RED}Opción no válida${NC}" ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Ejecutar menú si el script se llama directamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main
fi
