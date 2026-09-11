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
