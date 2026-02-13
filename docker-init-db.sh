#!/bin/bash
# Script para inicializar la base de datos con datos de respaldo

set -e

echo "Esperando a que MySQL esté listo..."
until mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
  echo 'Reintentando MySQL...'
  sleep 1
done

echo "MySQL está listo!"

# Importar esquema
echo "Importando esquema..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /init-scripts/schema.sql

# Importar datos de respaldo si existe
if [ -f /init-scripts/backup.sql ]; then
  echo "Importando datos de respaldo..."
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /init-scripts/backup.sql
fi

echo "Base de datos inicializada correctamente!"
