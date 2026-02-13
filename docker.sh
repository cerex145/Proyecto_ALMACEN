#!/bin/bash
# Script para manejo de Docker Compose

set -e

case "$1" in
  up)
    echo "🚀 Iniciando stack completo (MySQL + API + Renderer)..."
    docker compose up -d
    echo "✅ Stack iniciado!"
    echo ""
    echo "Acceso a los servicios:"
    echo "  - Renderer (Frontend): http://localhost:5173"
    echo "  - API: http://localhost:3000"
    echo "  - MySQL: localhost:3306"
    echo ""
    echo "Para ver logs: docker compose logs -f"
    ;;
  down)
    echo "🛑 Deteniendo stack..."
    docker compose down
    echo "✅ Stack detenido"
    ;;
  logs)
    echo "📋 Mostrando logs..."
    docker compose logs -f --tail=50
    ;;
  rebuild)
    echo "🔨 Reconstruyendo imágenes..."
    docker compose build --no-cache
    docker compose up -d
    echo "✅ Stack reconstruido e iniciado"
    ;;
  status)
    echo "📊 Estado del stack:"
    docker compose ps
    ;;
  clean)
    echo "🧹 Limpiando volumenes y estado..."
    docker compose down -v
    echo "✅ Stack limpiado"
    ;;
  *)
    echo "Uso: ./docker.sh {up|down|logs|rebuild|status|clean}"
    echo ""
    echo "Comandos:"
    echo "  up       - Inicia el stack completo"
    echo "  down     - Detiene el stack"
    echo "  logs     - Muestra logs en tiempo real"
    echo "  rebuild  - Reconstruye imagenes y reinicia"
    echo "  status   - Muestra estado de contenedores"
    echo "  clean    - Limpia todo (volumenes incluidos)"
    exit 1
    ;;
esac
