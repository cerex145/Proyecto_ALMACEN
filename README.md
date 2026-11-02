# Sistema de Almacen

Guia corta de operacion para cambios seguros en el proyecto.

## Estado de servicios

- Backend productivo: `https://proyecto-almacen.onrender.com`
- Frontend productivo: Vercel, proyecto `renderer`
- Base de datos: Supabase PostgreSQL

## Validaciones seguras

Antes de desplegar cambios de bajo riesgo:

```bash
npm run verify:safe
npm run build:renderer
```

`verify:safe` no modifica Supabase. Valida reglas locales importantes:

- El inventario considera correctamente salidas canceladas (`SALIDA_REVERSA`).
- El servicio de PDF puede generar un documento valido con fuentes reales.

## Reglas de trabajo

- Hacer backup de Supabase antes de cualquier cambio de datos.
- No versionar backups, Excel/PDF locales ni scripts temporales de diagnostico.
- Mantener cambios de frontend y backend en commits separados cuando el riesgo sea distinto.
- Probar ingreso, salida, Kardex, inventario y PDF cuando se toque stock o documentos.

## Comandos frecuentes

```bash
npm run dev:full
npm run build:renderer
npm run verify:safe
```

Para revisar que no quedaron archivos accidentales:

```bash
git status --short
```

## Correcciones operativas

La API exige una sesión vigente. El registro de usuarios y los roles requieren administrador. Las sesiones duran ocho horas por defecto y se validan con el usuario y su rol actuales.

Los movimientos de stock usan bloqueos por producto, lotes exactos y auditoría. Las salidas importadas conservan un detalle por lote consumido. Las operaciones antiguas sin trazabilidad suficiente se bloquean para revisión. Los ajustes se registran también en Kardex.

Las alertas se calculan desde lotes con existencias y fechas actuales. Lecturas, descartes y anticipación se guardan como eventos en la tabla existente de auditoría, sin migraciones.

Pruebas de regresión sin acceso a Supabase:

```bash
npm run test:regression
npm run verify:safe
```

Los respaldos usan pg_dump en formato nativo e incluyen el esquema público, JSON, restricciones y secuencias. Se requieren pg_dump y pg_restore en PATH (o PG_DUMP_BIN y PG_RESTORE_BIN). DATABASE_URL se lee de apps/api/.env; las credenciales no se pasan por argumentos de proceso.

```bash
node scripts/backup-db.js
node scripts/restore-db.js --file backups/RESPALDO.dump --confirm-restore
```

La restauración crea primero un respaldo de seguridad. Los archivos SQL históricos necesitan revisión explícita; no se selecciona ni restaura uno automáticamente.

stock:rebuild funciona como diagnóstico por defecto. --apply requiere un respaldo previo y rechaza ajustes o referencias antiguas ambiguas que no puedan reconstruirse con certeza.

Esta corrección no cambia las entidades, el esquema de Supabase, Docker, Electron ni dependencias. No aplica reparaciones retroactivas a los datos de la nube.

## Corregir lote y vencimiento

En **Stock de inventario**, pulse **Editar lote** en la fila del ingreso que desea corregir. Cambie el número de lote o su fecha de vencimiento, indique el motivo y pulse **Guardar corrección**. La fecha puede quedar vacía para productos sin vencimiento.

La opción requiere permiso de actualización de productos/lotes; los usuarios de consulta no pueden guardar cambios. La corrección conserva cantidades y saldos, actualiza los documentos asociados y registra usuario, motivo y valores anteriores en auditoría. Si otro usuario modificó el lote, debe actualizar el inventario antes de intentarlo nuevamente. Los documentos antiguos que no identifican un ingreso con certeza requieren revisión y bloquean toda la corrección.
