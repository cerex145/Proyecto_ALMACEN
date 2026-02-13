#!/bin/bash

# Script de Backup Automático - Base de Datos ALMACEN
# Autor: Sistema ALMACEN
# Fecha: 2026-02-13

# Configuración
DB_HOST="127.0.0.1"
DB_USER="almacen_user"
DB_PASSWORD="almacen123"
DB_NAME="almacen"
BACKUP_DIR="/home/bugsara/CEREX/Proyecto_ALMACEN/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/almacen_backup_${DATE}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

log "=========================================="
log "Iniciando backup de base de datos: $DB_NAME"
log "=========================================="

# Realizar backup
echo -e "${YELLOW}Generando backup...${NC}"
if mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" --no-tablespaces "$DB_NAME" > "$BACKUP_FILE" 2>&1; then
    
    # Verificar que el archivo se creó
    if [ -f "$BACKUP_FILE" ]; then
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        LINE_COUNT=$(wc -l < "$BACKUP_FILE")
        
        echo -e "${GREEN}✓ Backup completado exitosamente${NC}"
        log "✓ Backup completado: $BACKUP_FILE"
        log "  - Tamaño: $FILE_SIZE"
        log "  - Líneas: $LINE_COUNT"
        
        # Comprimir backup
        echo -e "${YELLOW}Comprimiendo backup...${NC}"
        gzip "$BACKUP_FILE"
        COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        
        echo -e "${GREEN}✓ Backup comprimido: ${COMPRESSED_SIZE}${NC}"
        log "✓ Backup comprimido: ${BACKUP_FILE}.gz (${COMPRESSED_SIZE})"
        
        # Limpiar backups antiguos (mantener últimos 7 días)
        echo -e "${YELLOW}Limpiando backups antiguos (>7 días)...${NC}"
        find "$BACKUP_DIR" -name "almacen_backup_*.sql.gz" -type f -mtime +7 -delete
        REMAINING=$(find "$BACKUP_DIR" -name "almacen_backup_*.sql.gz" -type f | wc -l)
        log "  - Backups restantes: $REMAINING"
        
        echo -e "${GREEN}=========================================="
        echo -e "Backup completado exitosamente"
        echo -e "Archivo: ${BACKUP_FILE}.gz"
        echo -e "Tamaño: ${COMPRESSED_SIZE}"
        echo -e "==========================================${NC}"
        
        exit 0
    else
        echo -e "${RED}✗ Error: El archivo de backup no se creó${NC}"
        log "✗ ERROR: El archivo de backup no se creó"
        exit 1
    fi
else
    echo -e "${RED}✗ Error al generar el backup${NC}"
    log "✗ ERROR al ejecutar mysqldump"
    exit 1
fi
