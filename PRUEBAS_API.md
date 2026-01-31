# Guía de Pruebas - API REST

## Configuración Inicial

### 1. Configurar Base de Datos

Crear archivo `.env` en `apps/api/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=almacen_db
JWT_SECRET=tu-secreto-super-seguro
NODE_ENV=development
```

### 2. Crear Base de Datos y Ejecutar Migraciones

```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar migraciones
mysql -u root -p almacen_db < apps/api/migrations/001_create_clientes_and_ajustes.sql
```

### 3. Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm install

# O solo para el API
cd apps/api
npm install
```

### 4. Iniciar Servidor

```bash
# Desde la raíz del proyecto
npm run dev:api

# O desde apps/api
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## Pruebas con cURL

### Health Check

```bash
curl http://localhost:3000/health
```

---

## 1. Clientes

### Crear Cliente

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "CLI001",
    "razon_social": "Empresa Demo S.A.",
    "cuit": "30-12345678-9",
    "direccion": "Av. Corrientes 1234, CABA",
    "telefono": "+54 11 4444-5555",
    "email": "contacto@empresademo.com.ar"
  }'
```

### Listar Clientes

```bash
# Listar todos
curl http://localhost:3000/api/clientes

# Con búsqueda
curl "http://localhost:3000/api/clientes?busqueda=Demo"

# Solo activos
curl "http://localhost:3000/api/clientes?activo=true"

# Con paginación
curl "http://localhost:3000/api/clientes?page=1&limit=10"

# Con ordenamiento
curl "http://localhost:3000/api/clientes?orderBy=razon_social&order=ASC"
```

### Obtener Cliente por ID

```bash
curl http://localhost:3000/api/clientes/1
```

### Actualizar Cliente

```bash
curl -X PUT http://localhost:3000/api/clientes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "razon_social": "Empresa Demo S.A. - Actualizada",
    "telefono": "+54 11 5555-6666",
    "email": "nuevo@empresademo.com.ar"
  }'
```

### Desactivar Cliente

```bash
curl -X DELETE http://localhost:3000/api/clientes/1
```

### Exportar Clientes a Excel

```bash
# Exportar todos
curl http://localhost:3000/api/clientes/exportar -o clientes.xlsx

# Exportar solo activos
curl "http://localhost:3000/api/clientes/exportar?activo=true" -o clientes_activos.xlsx
```

### Importar Clientes desde Excel

Crear un archivo `clientes.xlsx` con las siguientes columnas:
- Código
- Razón Social
- CUIT
- Dirección
- Teléfono
- Email

```bash
curl -X POST http://localhost:3000/api/clientes/importar \
  -F "file=@clientes.xlsx"
```

---

## 2. Productos

### Crear Producto

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PROD001",
    "descripcion": "Tornillo M6 x 20mm",
    "stock_actual": 500
  }'
```

### Listar Productos

```bash
# Listar todos
curl http://localhost:3000/api/productos

# Con búsqueda
curl "http://localhost:3000/api/productos?busqueda=Tornillo"

# Solo activos
curl "http://localhost:3000/api/productos?activo=true"

# Con paginación
curl "http://localhost:3000/api/productos?page=1&limit=20"
```

### Obtener Producto por ID

```bash
curl http://localhost:3000/api/productos/1
```

### Actualizar Producto

```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Tornillo M6 x 20mm - Acero Inoxidable",
    "activo": true
  }'
```

### Desactivar Producto

```bash
curl -X DELETE http://localhost:3000/api/productos/1
```

### Exportar Productos a Excel

```bash
curl http://localhost:3000/api/productos/exportar -o productos.xlsx
```

### Importar Productos desde Excel

Crear un archivo `productos.xlsx` con las siguientes columnas:
- Código
- Descripción
- Stock Actual

```bash
curl -X POST http://localhost:3000/api/productos/importar \
  -F "file=@productos.xlsx"
```

---

## 3. Ajustes de Stock

### Crear Ajuste Positivo (Incrementar Stock)

```bash
curl -X POST http://localhost:3000/api/ajustes \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "tipo": "AJUSTE_POSITIVO",
    "cantidad": 100,
    "motivo": "Compra a proveedor",
    "observaciones": "Factura #0001-00012345 - Proveedor ABC S.A."
  }'
```

### Crear Ajuste Negativo (Decrementar Stock)

```bash
curl -X POST http://localhost:3000/api/ajustes \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "tipo": "AJUSTE_NEGATIVO",
    "cantidad": 25,
    "motivo": "Producto defectuoso",
    "observaciones": "Lote 2024-01 con defectos de fabricación"
  }'
```

### Listar Ajustes

```bash
# Listar todos
curl http://localhost:3000/api/ajustes

# Por producto
curl "http://localhost:3000/api/ajustes?producto_id=1"

# Por tipo
curl "http://localhost:3000/api/ajustes?tipo=AJUSTE_POSITIVO"

# Por rango de fechas
curl "http://localhost:3000/api/ajustes?fecha_desde=2024-01-01&fecha_hasta=2024-12-31"

# Con paginación
curl "http://localhost:3000/api/ajustes?page=1&limit=20"
```

### Obtener Ajuste por ID

```bash
curl http://localhost:3000/api/ajustes/1
```

### Reporte de Ajustes por Producto

```bash
# Todos los productos
curl http://localhost:3000/api/ajustes/reportes/por-producto

# Con rango de fechas
curl "http://localhost:3000/api/ajustes/reportes/por-producto?fecha_desde=2024-01-01&fecha_hasta=2024-12-31"
```

### Reporte de Ajustes por Tipo

```bash
# Resumen de ajustes por tipo
curl http://localhost:3000/api/ajustes/reportes/por-tipo

# Con rango de fechas
curl "http://localhost:3000/api/ajustes/reportes/por-tipo?fecha_desde=2024-01-01&fecha_hasta=2024-12-31"
```

---

## Pruebas con Postman

### Colección Postman

Puedes crear una colección con los siguientes requests:

1. **Health Check**: `GET http://localhost:3000/health`

2. **Clientes**
   - Create: `POST /api/clientes`
   - List: `GET /api/clientes`
   - Get: `GET /api/clientes/:id`
   - Update: `PUT /api/clientes/:id`
   - Delete: `DELETE /api/clientes/:id`
   - Export: `GET /api/clientes/exportar`
   - Import: `POST /api/clientes/importar`

3. **Productos**
   - Create: `POST /api/productos`
   - List: `GET /api/productos`
   - Get: `GET /api/productos/:id`
   - Update: `PUT /api/productos/:id`
   - Delete: `DELETE /api/productos/:id`
   - Export: `GET /api/productos/exportar`
   - Import: `POST /api/productos/importar`

4. **Ajustes**
   - Create: `POST /api/ajustes`
   - List: `GET /api/ajustes`
   - Get: `GET /api/ajustes/:id`
   - Report by Product: `GET /api/ajustes/reportes/por-producto`
   - Report by Type: `GET /api/ajustes/reportes/por-tipo`

---

## Validaciones y Errores

### Validaciones Implementadas

**Clientes:**
- ✅ Código y Razón Social obligatorios
- ✅ Código único
- ✅ Formato de email válido (opcional)

**Productos:**
- ✅ Código y Descripción obligatorios
- ✅ Código único
- ✅ Stock inicial no negativo

**Ajustes:**
- ✅ Producto debe existir
- ✅ Tipo válido (AJUSTE_POSITIVO o AJUSTE_NEGATIVO)
- ✅ Cantidad mayor a 0
- ✅ Stock suficiente para ajustes negativos
- ✅ Motivo obligatorio

### Ejemplos de Respuestas de Error

**Código duplicado:**
```json
{
  "success": false,
  "error": "El código ya existe"
}
```

**Stock insuficiente:**
```json
{
  "success": false,
  "error": "Stock insuficiente para realizar el ajuste negativo"
}
```

**Producto no encontrado:**
```json
{
  "success": false,
  "error": "Producto no encontrado"
}
```

---

## Datos de Prueba

### Script para Crear Datos de Prueba

```bash
#!/bin/bash

# Crear clientes
curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" -d '{"codigo":"CLI001","razon_social":"Ferretería El Tornillo","cuit":"30-12345678-9","direccion":"Av. Corrientes 1234","telefono":"+54 11 4444-5555","email":"contacto@tornillo.com"}'

curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" -d '{"codigo":"CLI002","razon_social":"Construcciones SA","cuit":"30-98765432-1","direccion":"Calle Falsa 456","telefono":"+54 11 6666-7777","email":"info@construcciones.com"}'

# Crear productos
curl -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" -d '{"codigo":"PROD001","descripcion":"Tornillo M6 x 20mm","stock_actual":500}'

curl -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" -d '{"codigo":"PROD002","descripcion":"Tuerca M6","stock_actual":300}'

curl -X POST http://localhost:3000/api/productos -H "Content-Type: application/json" -d '{"codigo":"PROD003","descripcion":"Arandela plana 6mm","stock_actual":1000}'

# Crear ajustes
curl -X POST http://localhost:3000/api/ajustes -H "Content-Type: application/json" -d '{"producto_id":1,"tipo":"AJUSTE_POSITIVO","cantidad":100,"motivo":"Compra inicial"}'

curl -X POST http://localhost:3000/api/ajustes -H "Content-Type: application/json" -d '{"producto_id":1,"tipo":"AJUSTE_NEGATIVO","cantidad":50,"motivo":"Venta"}'
```

---

## Troubleshooting

### Error: No se puede conectar a la base de datos

- Verificar que MySQL está ejecutándose
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Error: Cannot find module

```bash
npm install
```

### Error: Puerto 3000 en uso

Cambiar el puerto en `apps/api/src/server.js`:
```javascript
await fastify.listen({ port: 3001, host: '127.0.0.1' });
```

---

## Próximos Pasos

1. ✅ Implementar autenticación JWT
2. ✅ Agregar tests automatizados
3. ✅ Crear frontend Electron
4. ✅ Implementar movimientos de entrada/salida
5. ✅ Agregar generación de reportes PDF
