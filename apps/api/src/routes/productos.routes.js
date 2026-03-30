const ExcelJS = require('exceljs');
const { Brackets, Like } = require('typeorm');

const ProductoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        codigo: { type: 'string' },
        descripcion: { type: 'string' },
        proveedor: { type: 'string', nullable: true },
        tipo_documento: { type: 'string', enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'], nullable: true },
        numero_documento: { type: 'string', nullable: true },
        registro_sanitario: { type: 'string', nullable: true },
        proveedor_ruc: { type: 'string', nullable: true },
        fecha_ingreso: { type: 'string', format: 'date', nullable: true },
        lote: { type: 'string', nullable: true },
        fabricante: { type: 'string', nullable: true },
        categoria_ingreso: { type: 'string', nullable: true },
        procedencia: { type: 'string', nullable: true },
        unidad: { type: 'string', nullable: true },
        unidad_otro: { type: 'string', nullable: true },
        um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
        temperatura: { type: 'number', nullable: true },
        observaciones: { type: 'string', nullable: true },
        activo: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
    }
};

const PaginationSchema = {
    type: 'object',
    properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' }
    }
};

const ErrorResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        errores: { type: 'array', items: { type: 'string' } }
    }
};

const ProductoListResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: ProductoSchema },
        pagination: PaginationSchema
    }
};

const ProductoResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: ProductoSchema
    }
};

const ProductoResponseWithMessageSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: ProductoSchema,
        message: { type: 'string' }
    }
};

const tipoDocumentoValues = ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'];
const categoriaIngresoValues = ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'];
const umValues = ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'];

const nullableEnumSchema = (values) => ({
    anyOf: [
        { type: 'string', enum: values },
        { type: 'null' }
    ]
});

const nullableDateSchema = () => ({
    anyOf: [
        { type: 'string', format: 'date' },
        { type: 'null' }
    ]
});

async function productoRoutes(fastify, options) {
    const productoRepo = fastify.db.getRepository('Producto');
    const clienteRepo = fastify.db.getRepository('Cliente');
    const toActivoSmallint = (value) => (value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0);
    const mapTemperaturaEntrada = (value) => {
        const parsed = Number(value);
        const safe = Number.isFinite(parsed) ? parsed : 25;
        return { temperatura_min_c: safe, temperatura_max_c: safe };
    };
    const mapProductoSalida = (producto) => ({
        ...producto,
        temperatura: Number(producto.temperatura_min_c ?? producto.temperatura_max_c ?? 25)
    });

    // GET /api/productos - Listar con filtros y paginación
    fastify.get('/api/productos', {
        schema: {
            tags: ['Productos'],
            description: 'Listar productos con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    busqueda: { type: 'string' },
                    activo: { type: 'string', enum: ['true', 'false'] },
                    categoria_ingreso: { type: 'string' },
                    lote: { type: 'string' },
                    cliente_id: { type: 'integer' },
                    page: { type: 'integer', minimum: 1 },
                    limit: { type: 'integer', minimum: 1 },
                    orderBy: { type: 'string' },
                    order: { type: 'string', enum: ['ASC', 'DESC', 'asc', 'desc'] }
                }
            },
            response: {
                200: ProductoListResponseSchema
            }
        }
    }, async (request, reply) => {
        const {
            busqueda = '',
            activo,
            categoria_ingreso,
            lote,
            cliente_id,
            numero_documento, // <-- Nuevo filtro
            page = 1,
            limit = 50,
            orderBy = 'descripcion',
            order = 'ASC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = productoRepo.createQueryBuilder('producto');

        if (busqueda) {
            queryBuilder.where(
                '(producto.codigo LIKE :busqueda OR producto.descripcion LIKE :busqueda)',
                { busqueda: `%${busqueda}%` }
            );
        }

        if (categoria_ingreso) {
            queryBuilder.andWhere('producto.categoria_ingreso = :categoria_ingreso', { categoria_ingreso });
        }

        if (activo !== undefined) {
            queryBuilder.andWhere('producto.activo = :activo', { activo: toActivoSmallint(activo) });
        }

        if (numero_documento) {
            queryBuilder.andWhere('producto.numero_documento LIKE :numero_documento', { numero_documento: `%${numero_documento}%` });
        }

        if (cliente_id) {
            // Filtrado robusto por cliente:
            // 1) Normaliza proveedor/razon_social para evitar fallos por puntos, espacios o formato.
            // 2) Como respaldo usa relación por lotes->nota_ingreso, priorizando ni.cliente_id cuando exista.
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where(
                    `regexp_replace(upper(coalesce(producto.proveedor, '')), '[^A-Z0-9]', '', 'g') = (
                        SELECT regexp_replace(upper(coalesce(c.razon_social, '')), '[^A-Z0-9]', '', 'g')
                        FROM clientes c
                        WHERE c.id = :cliente_id
                    )`,
                    { cliente_id: Number(cliente_id) }
                );

                qb.orWhere(qbInner => {
                    const subQuery = qbInner.subQuery()
                        .select("1")
                        .from("lotes", "l")
                        .innerJoin("notas_ingreso", "ni", "l.nota_ingreso_id = ni.id")
                        .where("l.producto_id = producto.id")
                        .andWhere(`(
                            ni.cliente_id = :cliente_id
                            OR regexp_replace(upper(coalesce(ni.proveedor, '')), '[^A-Z0-9]', '', 'g') = (
                                SELECT regexp_replace(upper(coalesce(c2.razon_social, '')), '[^A-Z0-9]', '', 'g')
                                FROM clientes c2
                                WHERE c2.id = :cliente_id
                            )
                        )`)
                        .getQuery();
                    return "EXISTS " + subQuery;
                });
            }));
        }

        queryBuilder
            .orderBy(`producto.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [productos, total] = await queryBuilder.getManyAndCount();

        // Si buscan por lote, filtrar lotes disponibles
        let productosConLotes = productos;
        if (lote) {
            const loteRepo = fastify.db.getRepository('Lote');
            productosConLotes = await Promise.all(
                productos.map(async (producto) => {
                    const lotes = await loteRepo.find({
                        where: {
                            producto_id: producto.id,
                            numero_lote: Like(`%${lote}%`)
                        }
                    });
                    return { ...producto, lotes };
                })
            );
        }

        return {
            success: true,
            data: productosConLotes.map(mapProductoSalida),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/productos/plantilla - Descargar plantilla de importación
    fastify.get('/api/productos/plantilla', {
        schema: {
            tags: ['Productos'],
            description: 'Descargar plantilla Excel para importación masiva de productos',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla');

        // Título e instrucciones
        const totalCols = 11;
        worksheet.mergeCells(1, 1, 1, totalCols);
        worksheet.getCell('A1').value = 'PLANTILLA DE CARGA MASIVA — DATOS POR PRODUCTO';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };

        worksheet.mergeCells(2, 1, 2, totalCols);
        worksheet.getCell('A2').value = 'Los datos globales (proveedor, tipo/n° de documento, categoría) se configuran en el panel izquierdo del sistema y se aplican a todos los productos automáticamente.';
        worksheet.getCell('A2').font = { italic: true, size: 10 };
        worksheet.getCell('A2').alignment = { horizontal: 'center', wrapText: true };
        worksheet.getRow(2).height = 30;

        // Encabezados en la fila 3 — SOLO campos por-producto
        const row3 = worksheet.getRow(3);
        const columnas = [
            { header: '⭐ Cod. Producto', key: 'codigo', width: 18 },
            { header: '⭐ Descripción', key: 'descripcion', width: 45 },
            { header: 'Lote', key: 'lote', width: 16 },
            { header: 'Registro Sanitario', key: 'registro_sanitario', width: 22 },
            { header: 'Fecha Ingreso', key: 'fecha_ingreso', width: 16 },
            { header: 'F. Vencimiento', key: 'fecha_vencimiento', width: 16 },
            { header: 'Unidad', key: 'unidad', width: 12 },
            { header: 'UM', key: 'um', width: 10 },
            { header: 'Fabricante', key: 'fabricante', width: 25 },
            { header: 'Procedencia', key: 'procedencia', width: 18 },
            { header: 'Observaciones', key: 'observaciones', width: 35 }
        ];

        columnas.forEach((col, i) => {
            const cell = row3.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.getColumn(i + 1).width = col.width;
        });

        // Hoja secundaria con ejemplo completo (no afecta el parseo, que usa la primera hoja)
        const ejemplo = workbook.addWorksheet('Ejemplo');
        const rowEjemploHeader = ejemplo.getRow(1);
        columnas.forEach((col, i) => {
            const cell = rowEjemploHeader.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            ejemplo.getColumn(i + 1).width = col.width;
        });

        ejemplo.addRow([
            'PROD-001',
            'Paracetamol 500 mg Tabletas x 100',
            'L240315A',
            'RS-12345',
            '2026-03-15',
            '2028-03-15',
            'Caja',
            'UND',
            'Laboratorios Salud',
            'Perú',
            'Ejemplo referencial'
        ]);

        ejemplo.addRow([
            'PROD-002',
            'Ibuprofeno 400 mg Tabletas x 50',
            'L240315B',
            'RS-67890',
            '2026-03-15',
            '2027-12-31',
            'Blíster',
            'UND',
            'Pharma Global',
            'Colombia',
            'Segundo ejemplo'
        ]);

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla_productos.xlsx');
        return reply.send(buffer);
    });

    // GET /api/productos/:id - Obtener un producto
    fastify.get('/api/productos/:id', {
        schema: {
            tags: ['Productos'],
            description: 'Obtener un producto por ID',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ProductoResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const producto = await productoRepo.findOneBy({ id: Number(id) });

        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        return { success: true, data: mapProductoSalida(producto) };
    });

    // POST /api/productos - Crear producto
    fastify.post('/api/productos', {
        schema: {
            tags: ['Productos'],
            description: 'Crear un nuevo producto',
            body: {
                type: 'object',
                required: ['codigo', 'descripcion'],
                properties: {
                    codigo: { type: 'string' },
                    descripcion: { type: 'string' },
                    cliente_id: { type: 'integer', nullable: true },
                    proveedor: { type: 'string', nullable: true },
                    tipo_documento: nullableEnumSchema(tipoDocumentoValues),
                    numero_documento: { type: 'string', nullable: true },
                    registro_sanitario: { type: 'string', nullable: true },
                    proveedor_ruc: { type: 'string', nullable: true },
                    fecha_ingreso: nullableDateSchema(),
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: nullableEnumSchema(categoriaIngresoValues),
                    procedencia: { type: 'string', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: nullableEnumSchema(umValues),
                    temperatura: { type: 'number', nullable: true },
                    observaciones: { type: 'string', nullable: true }
                }
            },
            response: {
                201: ProductoResponseWithMessageSchema,
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const {
            codigo,
            descripcion,
            cliente_id,
            proveedor,
            tipo_documento,
            numero_documento,
            registro_sanitario,
            proveedor_ruc,
            fecha_ingreso,
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            unidad,
            unidad_otro,
            um,
            temperatura,
            observaciones
        } = request.body;

        // Validaciones
        if (!codigo || !descripcion) {
            return reply.status(400).send({
                success: false,
                error: 'Código y Descripción son obligatorios'
            });
        }

        // Verificar código único
        const existente = await productoRepo.findOneBy({ codigo });
        if (existente) {
            return reply.status(400).send({
                success: false,
                error: 'El código ya existe'
            });
        }

        // Validar categoría si se proporciona
        const categoriasValidas = categoriaIngresoValues;
        if (categoria_ingreso && !categoriasValidas.includes(categoria_ingreso)) {
            return reply.status(400).send({
                success: false,
                error: 'Categoría de ingreso inválida'
            });
        }

        let proveedorFinal = proveedor || null;
        let proveedorRucFinal = proveedor_ruc || null;

        if (cliente_id !== undefined && cliente_id !== null && cliente_id !== '') {
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) {
                return reply.status(400).send({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }

            proveedorFinal = cliente.razon_social || proveedorFinal;
            proveedorRucFinal = cliente.cuit || proveedorRucFinal;
        }

        const nuevoProducto = productoRepo.create({
            codigo,
            descripcion,
            proveedor: proveedorFinal,
            tipo_documento: tipo_documento || null,
            numero_documento: numero_documento || null,
            registro_sanitario: registro_sanitario || null,
            proveedor_ruc: proveedorRucFinal,
            fecha_ingreso: fecha_ingreso || null,
            lote: lote || null,
            fabricante: fabricante || null,
            categoria_ingreso: categoria_ingreso || null,
            procedencia,
            unidad: unidad || 'UND',
            unidad_otro: unidad_otro || null,
            um: um !== undefined ? um : null,
            ...mapTemperaturaEntrada(temperatura),
            observaciones: observaciones || null,
            activo: toActivoSmallint(true)
        });

        await productoRepo.save(nuevoProducto);

        return reply.status(201).send({
            success: true,
            data: nuevoProducto,
            message: 'Producto creado exitosamente'
        });
    });

    // PUT /api/productos/:id - Actualizar producto
    fastify.put('/api/productos/:id', {
        schema: {
            tags: ['Productos'],
            description: 'Actualizar un producto existente',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    codigo: { type: 'string' },
                    descripcion: { type: 'string' },
                    activo: { type: 'boolean' },
                    cliente_id: { type: 'integer', nullable: true },
                    proveedor: { type: 'string', nullable: true },
                    tipo_documento: nullableEnumSchema(tipoDocumentoValues),
                    numero_documento: { type: 'string', nullable: true },
                    registro_sanitario: { type: 'string', nullable: true },
                    proveedor_ruc: { type: 'string', nullable: true },
                    fecha_ingreso: nullableDateSchema(),
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: nullableEnumSchema(categoriaIngresoValues),
                    procedencia: { type: 'string', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: nullableEnumSchema(umValues),
                    temperatura: { type: 'number', nullable: true },
                    observaciones: { type: 'string', nullable: true }
                }
            },
            response: {
                200: ProductoResponseWithMessageSchema,
                400: ErrorResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const {
            codigo,
            descripcion,
            activo,
            cliente_id,
            proveedor,
            tipo_documento,
            numero_documento,
            registro_sanitario,
            proveedor_ruc,
            fecha_ingreso,
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            unidad,
            unidad_otro,
            um,
            temperatura,
            observaciones
        } = request.body;

        const producto = await productoRepo.findOneBy({ id: Number(id) });
        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        // Validaciones
        if (!descripcion) {
            return reply.status(400).send({
                success: false,
                error: 'Descripción es obligatoria'
            });
        }

        // Verificar código único si se cambió
        if (codigo && codigo !== producto.codigo) {
            const existente = await productoRepo.findOneBy({ codigo });
            if (existente) {
                return reply.status(400).send({
                    success: false,
                    error: 'El código ya existe'
                });
            }
            producto.codigo = codigo;
        }

        if (cliente_id !== undefined && cliente_id !== null && cliente_id !== '') {
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) {
                return reply.status(400).send({
                    success: false,
                    error: 'Cliente no encontrado'
                });
            }

            producto.proveedor = cliente.razon_social || null;
            producto.proveedor_ruc = cliente.cuit || null;
        }

        producto.descripcion = descripcion;
        if (activo !== undefined) producto.activo = toActivoSmallint(activo);
        if (proveedor) producto.proveedor = proveedor;
        if (tipo_documento !== undefined) producto.tipo_documento = tipo_documento || null;
        if (numero_documento !== undefined) producto.numero_documento = numero_documento || null;
        if (registro_sanitario !== undefined) producto.registro_sanitario = registro_sanitario || null;
        if (proveedor_ruc !== undefined) producto.proveedor_ruc = proveedor_ruc || null;
        if (fecha_ingreso !== undefined) producto.fecha_ingreso = fecha_ingreso || null;
        if (lote !== undefined) producto.lote = lote || null;
        if (fabricante !== undefined) producto.fabricante = fabricante || null;
        if (categoria_ingreso !== undefined) producto.categoria_ingreso = categoria_ingreso || null;
        if (procedencia) producto.procedencia = procedencia;
        if (unidad !== undefined) producto.unidad = unidad || 'UND';
        if (unidad_otro !== undefined) producto.unidad_otro = unidad_otro || null;
        if (um !== undefined) producto.um = um || null;
        if (temperatura !== undefined) {
            const mappedTemp = mapTemperaturaEntrada(temperatura);
            producto.temperatura_min_c = mappedTemp.temperatura_min_c;
            producto.temperatura_max_c = mappedTemp.temperatura_max_c;
        }
        if (observaciones !== undefined) producto.observaciones = observaciones || null;

        await productoRepo.save(producto);

        return { success: true, data: mapProductoSalida(producto), message: 'Producto actualizado exitosamente' };
    });

    // DELETE /api/productos/:id - Eliminar (lógico)
    fastify.delete('/api/productos/:id', {
        schema: {
            tags: ['Productos'],
            description: 'Desactivar un producto (eliminación lógica)',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const producto = await productoRepo.findOneBy({ id: Number(id) });

        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        producto.activo = toActivoSmallint(false);
        await productoRepo.save(producto);

        return { success: true, message: 'Producto desactivado exitosamente' };
    });

    // POST /api/productos/parsear-plantilla - Parsea el xlsx y devuelve filas como JSON
    fastify.post('/api/productos/parsear-plantilla', {
        schema: {
            tags: ['Productos'],
            description: 'Parsea la plantilla Excel de carga masiva y devuelve las filas como JSON'
        }
    }, async (request, reply) => {
        const parts = request.parts();
        let fileBuffer = null;

        for await (const part of parts) {
            if (part.type === 'file') {
                fileBuffer = await part.toBuffer();
                break;
            }
        }

        if (!fileBuffer) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        // Mapeo por POSICIÓN de columna — solo campos por-producto
        const COLUMNAS = [
            'codigo',              // A - col 1
            'descripcion',         // B - col 2
            'lote',                // C - col 3
            'registro_sanitario',  // D - col 4
            'fecha_ingreso',       // E - col 5
            'fecha_vencimiento',   // F - col 6
            'unidad',              // G - col 7
            'um',                  // H - col 8
            'fabricante',          // I - col 9
            'procedencia',         // J - col 10
            'observaciones'        // K - col 11
        ];
        const NUMERICAS = [];

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const ws = workbook.worksheets[0];

        const errores = [];
        const filas = [];

        ws.eachRow((row, rowNumber) => {
            if (rowNumber <= 3) return; // Saltar título, instrucciones y encabezados

            const values = row.values; // values[1] = col A, values[2] = col B, etc.

            // Saltar filas completamente vacías
            const tieneAlgo = COLUMNAS.some((_, i) => {
                const v = values[i + 1];
                return v !== null && v !== undefined && String(v).trim() !== '';
            });
            if (!tieneAlgo) return;

            const obj = {};
            const FIELDS_FECHA = ['fecha_ingreso', 'fecha_vencimiento'];

            // Convierte cualquier formato de fecha a YYYY-MM-DD
            const normalizeDate = (v) => {
                if (v instanceof Date) return v.toISOString().split('T')[0];
                const s = String(v).trim();
                // DD/MM/YYYY o DD-MM-YYYY
                const dmySlash = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (dmySlash) return `${dmySlash[3]}-${dmySlash[2].padStart(2, '0')}-${dmySlash[1].padStart(2, '0')}`;
                // YYYY-MM-DD o YYYY/MM/DD
                const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
                if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
                return null; // formato no reconocido
            };

            COLUMNAS.forEach((key, i) => {
                let val = values[i + 1];
                // Manejar celdas con objetos rich text de ExcelJS
                if (val && typeof val === 'object' && val.text) val = val.text;
                if (val && typeof val === 'object' && val.result !== undefined) val = val.result;

                // Campos de fecha: normalizar a YYYY-MM-DD
                if (FIELDS_FECHA.includes(key)) {
                    if (val !== null && val !== undefined && String(val).trim() !== '') {
                        obj[key] = normalizeDate(val);
                    } else {
                        obj[key] = null;
                    }
                    return;
                }

                const str = val !== null && val !== undefined ? String(val).trim() : '';
                if (NUMERICAS.includes(key)) {
                    obj[key] = str !== '' ? parseFloat(str) : null;
                } else {
                    obj[key] = str || null;
                }
            });


            // Validaciones mínimas
            if (!obj.codigo) {
                errores.push(`Fila ${rowNumber}: falta el Código de Producto`);
                return;
            }
            if (!obj.descripcion) {
                errores.push(`Fila ${rowNumber}: falta la Descripción`);
                return;
            }
            filas.push(obj);
        });

        return reply.send({
            success: true,
            filas,
            errores,
            total: filas.length
        });
    });

    // POST /api/productos/importar - Importar desde Excel
    fastify.post('/api/productos/importar', {

        schema: {
            tags: ['Productos'],
            description: 'Importar productos desde archivo Excel (multipart/form-data)',
            consumes: ['multipart/form-data'],
            // No se declara body schema para rutas multipart: se usa request.parts() directamente
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const parts = request.parts();
        let fileBuffer = null;
        let numeroDocumentoGeneral = null;

        for await (const part of parts) {
            if (part.type === 'file') {
                fileBuffer = await part.toBuffer();
            } else {
                if (part.fieldname === 'numero_documento') {
                    numeroDocumentoGeneral = part.value;
                }
            }
        }

        if (!fileBuffer) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.worksheets[0];

        const productos = [];
        const errores = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const [codigo, descripcion] = row.values.slice(1);

            if (!codigo || !descripcion) {
                errores.push(`Fila ${rowNumber}: Código y Descripción son obligatorios`);
                return;
            }

            productos.push({
                codigo: String(codigo),
                descripcion: String(descripcion),
                activo: toActivoSmallint(true)
            });
        });

        if (errores.length > 0) {
            return reply.status(400).send({ success: false, errores });
        }

        let insertados = 0;
        let actualizados = 0;

        for (const productoData of productos) {
            const existente = await productoRepo.findOneBy({ codigo: productoData.codigo });
            if (!existente) {
                const nuevoProducto = productoRepo.create({
                    ...productoData,
                    numero_documento: numeroDocumentoGeneral || null
                });
                await productoRepo.save(nuevoProducto);
                insertados++;
            } else {
                existente.descripcion = productoData.descripcion;
                if (numeroDocumentoGeneral) {
                    existente.numero_documento = numeroDocumentoGeneral;
                }
                await productoRepo.save(existente);
                actualizados++;
            }
        }

        return {
            success: true,
            message: `Importación completada: ${insertados} insertados, ${actualizados} actualizados`
        };
    });

    // POST /api/productos/lote - Alta masiva manual
    fastify.post('/api/productos/lote', {
        schema: {
            tags: ['Productos'],
            description: 'Crear o actualizar múltiples productos asignados a un número de documento',
            body: {
                type: 'object',
                required: ['numero_documento', 'productos'],
                properties: {
                    numero_documento: { type: 'string' },
                    productos: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['codigo', 'descripcion'],
                            properties: {
                                codigo: { type: 'string' },
                                descripcion: { type: 'string' },
                                lote: { type: 'string' },
                                // se pueden omitir o agregar los mismos que productoSchema si fuera necesario
                            }
                        }
                    }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        insertados: { type: 'integer' },
                        actualizados: { type: 'integer' }
                    }
                },
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { numero_documento, productos } = request.body;

        if (!numero_documento || !productos || !Array.isArray(productos) || productos.length === 0) {
            return reply.status(400).send({
                success: false,
                error: 'Número de documento y una lista de productos son requeridos'
            });
        }

        let insertados = 0;
        let actualizados = 0;

        for (const prod of productos) {
            if (!prod.codigo || !prod.descripcion) {
                continue;
            }

            const existente = await productoRepo.findOneBy({ codigo: prod.codigo });
            if (!existente) {
                const nuevoProducto = productoRepo.create({
                    codigo: prod.codigo,
                    descripcion: prod.descripcion,
                    lote: prod.lote || null,
                    numero_documento: numero_documento,
                    activo: toActivoSmallint(true)
                });
                await productoRepo.save(nuevoProducto);
                insertados++;
            } else {
                existente.descripcion = prod.descripcion;
                if (prod.lote) existente.lote = prod.lote;
                existente.numero_documento = numero_documento;
                await productoRepo.save(existente);
                actualizados++;
            }
        }

        return reply.status(201).send({
            success: true,
            message: `Lote procesado: ${insertados} creados, ${actualizados} actualizados`,
            insertados,
            actualizados
        });
    });

    // GET /api/productos/inventario - Stock real calculado desde los lotes
    fastify.get('/api/productos/inventario', {
        schema: {
            tags: ['Productos'],
            description: 'Vista de inventario: stock real calculado desde la suma de lotes disponibles',
            querystring: {
                type: 'object',
                properties: {
                    busqueda: { type: 'string' },
                    categoria_ingreso: { type: 'string' },
                    activo: { type: 'string', enum: ['true', 'false'] }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer' },
                                    codigo: { type: 'string' },
                                    descripcion: { type: 'string' },
                                    proveedor: { type: 'string', nullable: true },
                                    categoria_ingreso: { type: 'string', nullable: true },
                                    um: { type: 'string', nullable: true },
                                    unidad: { type: 'string', nullable: true },
                                    registro_sanitario: { type: 'string', nullable: true },
                                    stock_minimo: { type: 'number' },
                                    stock_calculado: { type: 'number' },
                                    total_lotes: { type: 'integer' },
                                    proximo_vencimiento: { type: 'string', nullable: true },
                                    activo: { type: 'boolean' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { busqueda, categoria_ingreso, activo } = request.query;

        const qb = productoRepo.createQueryBuilder('producto');

        const busquedaTexto = (busqueda || '').trim();
        if (busquedaTexto) {
            qb.andWhere(
                '(producto.codigo LIKE :b OR producto.descripcion LIKE :b OR producto.proveedor LIKE :b OR producto.fabricante LIKE :b)',
                { b: `%${busquedaTexto}%` }
            );
        }
        if (categoria_ingreso) {
            qb.andWhere('producto.categoria_ingreso = :cat', { cat: categoria_ingreso });
        }
        if (activo !== undefined) {
            qb.andWhere('producto.activo = :activo', { activo: toActivoSmallint(activo) });
        }

        qb.leftJoin('lotes', 'lote', 'lote.producto_id = producto.id');

        qb.select([
            'producto.id AS id',
            'producto.codigo AS codigo',
            'producto.descripcion AS descripcion',
            'producto.proveedor AS proveedor',
            'producto.categoria_ingreso AS categoria_ingreso',
            'producto.um AS um',
            'producto.unidad AS unidad',
            'producto.registro_sanitario AS registro_sanitario',
            'COALESCE(SUM(COALESCE(NULLIF(lote.cantidad_disponible, 0), lote.cantidad_actual, lote.cantidad_inicial, 0)), 0) AS stock_calculado',
            'COUNT(lote.id) AS total_lotes',
            "MIN(CASE WHEN COALESCE(NULLIF(lote.cantidad_disponible, 0), lote.cantidad_actual, lote.cantidad_inicial, 0) > 0 THEN lote.fecha_vencimiento END) AS proximo_vencimiento",
            'producto.activo AS activo'
        ]);

        qb.groupBy('producto.id')
            .addGroupBy('producto.codigo')
            .addGroupBy('producto.descripcion')
            .addGroupBy('producto.proveedor')
            .addGroupBy('producto.categoria_ingreso')
            .addGroupBy('producto.um')
            .addGroupBy('producto.unidad')
            .addGroupBy('producto.registro_sanitario')
            .addGroupBy('producto.activo')
            .orderBy('producto.descripcion', 'ASC');

        const rows = await qb.getRawMany();

        const data = rows.map((row) => ({
            id: Number(row.id),
            codigo: row.codigo,
            descripcion: row.descripcion,
            proveedor: row.proveedor || null,
            categoria_ingreso: row.categoria_ingreso || null,
            um: row.um || null,
            unidad: row.unidad || null,
            registro_sanitario: row.registro_sanitario || null,
            stock_minimo: 0,
            stock_calculado: Number(row.stock_calculado || 0),
            total_lotes: Number(row.total_lotes || 0),
            proximo_vencimiento: row.proximo_vencimiento || null,
            activo: Number(row.activo || 0) === 1
        }));

        return { success: true, data };
    });

    // GET /api/productos/exportar - Exportar a Excel
    fastify.get('/api/productos/exportar', {
        schema: {
            tags: ['Productos'],
            description: 'Exportar productos a archivo Excel',
            querystring: {
                type: 'object',
                properties: {
                    activo: { type: 'string', enum: ['true', 'false'] }
                }
            },
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const { activo } = request.query;

        const queryBuilder = productoRepo.createQueryBuilder('producto');

        if (activo !== undefined) {
            queryBuilder.where('producto.activo = :activo', { activo: toActivoSmallint(activo) });
        }

        const productos = await queryBuilder.orderBy('producto.descripcion', 'ASC').getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 50 },
            { header: 'Activo', key: 'activo', width: 10 }
        ];

        productos.forEach(producto => {
            worksheet.addRow({
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                activo: Number(producto.activo || 0) === 1 ? 'Sí' : 'No'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=productos.xlsx');
        return reply.send(buffer);
    });
}
module.exports = productoRoutes;
