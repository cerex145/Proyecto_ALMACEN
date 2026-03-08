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
        r_i: { type: 'string', nullable: true },
        codigo_gln: { type: 'string', nullable: true },
        proveedor_ruc: { type: 'string', nullable: true },
        fecha_ingreso: { type: 'string', format: 'date', nullable: true },
        codigo_interno: { type: 'string', nullable: true },
        lote: { type: 'string', nullable: true },
        fabricante: { type: 'string', nullable: true },
        categoria_ingreso: { type: 'string', nullable: true },
        procedencia: { type: 'string', nullable: true },
        fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
        unidad: { type: 'string', nullable: true },
        unidad_otro: { type: 'string', nullable: true },
        um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
        temperatura: { type: 'number', nullable: true },
        cantidad_bultos: { type: 'number' },
        cantidad_cajas: { type: 'number' },
        cantidad_por_caja: { type: 'number' },
        cantidad_fraccion: { type: 'number' },
        cantidad_total: { type: 'number' },
        observaciones: { type: 'string', nullable: true },
        stock_actual: { type: 'number' },
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

async function productoRoutes(fastify, options) {
    const productoRepo = fastify.db.getRepository('Producto');

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
            queryBuilder.andWhere('producto.activo = :activo', { activo: activo === 'true' });
        }

        if (numero_documento) {
            queryBuilder.andWhere('producto.numero_documento LIKE :numero_documento', { numero_documento: `%${numero_documento}%` });
        }

        if (cliente_id) {
            // Filtrar por cliente considerando productos creados en inventario (proveedor = razon_social)
            // y como respaldo productos con lotes asociados via NotaIngreso.
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where(
                    'producto.proveedor = (SELECT razon_social FROM clientes WHERE id = :cliente_id)',
                    { cliente_id }
                );

                qb.orWhere(qbInner => {
                    const subQuery = qbInner.subQuery()
                        .select("1")
                        .from("lotes", "l")
                        .innerJoin("notas_ingreso", "ni", "l.nota_ingreso_id = ni.id")
                        .innerJoin("clientes", "c", "c.razon_social = ni.proveedor")
                        .where("l.producto_id = producto.id")
                        .andWhere("c.id = :cliente_id")
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
            data: productosConLotes,
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
        worksheet.mergeCells('A1', 'N1');
        worksheet.getCell('A1').value = 'PLANTILLA DE IMPORTACIÓN DE PRODUCTOS';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2', 'N2');
        worksheet.getCell('A2').value = 'Instrucciones: Llenar los datos desde la fila 4. Los campos Código, Descripción y Cant. Total son obligatorios.';
        worksheet.getCell('A2').font = { italic: true };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Encabezados en la fila 3
        const row3 = worksheet.getRow(3);
        const columnas = [
            { header: 'Cod. Producto*', key: 'codigo', width: 15 },
            { header: 'Producto*', key: 'descripcion', width: 40 },
            { header: 'Lote', key: 'lote', width: 15 },
            { header: 'Registro Sanitario', key: 'registro_sanitario', width: 25 },
            { header: 'R/I', key: 'r_i', width: 15 },
            { header: 'Código GLN', key: 'codigo_gln', width: 20 },
            { header: 'Proveedor', key: 'proveedor_ruc', width: 15 },
            { header: 'Razón Social', key: 'proveedor', width: 35 },
            { header: 'Fecha Ingreso', key: 'fecha_ingreso', width: 20 },
            { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 20 },
            { header: 'T. Documento', key: 'tipo_documento', width: 15 },
            { header: 'N° de Documento', key: 'numero_documento', width: 20 },
            { header: 'Código Interno', key: 'codigo_interno', width: 20 },
            { header: 'Unidad', key: 'unidad', width: 15 },
            { header: 'UM', key: 'um', width: 15 },
            { header: 'Cant. Bultos', key: 'cantidad_bultos', width: 15 },
            { header: 'Cant. Cajas', key: 'cantidad_cajas', width: 15 },
            { header: 'Cant. por Caja', key: 'cantidad_por_caja', width: 15 },
            { header: 'Cant. Fracción', key: 'cantidad_fraccion', width: 15 },
            { header: 'Cantidad Total*', key: 'cantidad_total', width: 15 },
            { header: 'Fabricante', key: 'fabricante', width: 25 },
            { header: 'Procedencia', key: 'procedencia', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
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

        // Algunas filas de ejemplo (Opcional)
        // worksheet.addRow(['PROD-001', 'Paracetamol 500mg', 'L-2023', 'Laboratorio A', '2025-12-31', 'CAJ', 15, 25, 1, 10, 100, 0, 1000, 'Sin observaciones']);

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

        return { success: true, data: producto };
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
                    stock_actual: { type: 'number', nullable: true },
                    proveedor: { type: 'string', nullable: true },
                    tipo_documento: { type: 'string', enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'], nullable: true },
                    numero_documento: { type: 'string', nullable: true },
                    registro_sanitario: { type: 'string', nullable: true },
                    r_i: { type: 'string', nullable: true },
                    codigo_gln: { type: 'string', nullable: true },
                    proveedor_ruc: { type: 'string', nullable: true },
                    fecha_ingreso: { type: 'string', format: 'date', nullable: true },
                    codigo_interno: { type: 'string', nullable: true },
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'], nullable: true },
                    procedencia: { type: 'string', nullable: true },
                    fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
                    temperatura: { type: 'number', nullable: true },
                    cantidad_bultos: { type: 'number', nullable: true },
                    cantidad_cajas: { type: 'number', nullable: true },
                    cantidad_por_caja: { type: 'number', nullable: true },
                    cantidad_fraccion: { type: 'number', nullable: true },
                    cantidad_total: { type: 'number', nullable: true },
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
            stock_actual,
            proveedor,
            tipo_documento,
            numero_documento,
            registro_sanitario,
            r_i,
            codigo_gln,
            proveedor_ruc,
            fecha_ingreso,
            codigo_interno,
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento,
            unidad,
            unidad_otro,
            um,
            temperatura,
            cantidad_bultos,
            cantidad_cajas,
            cantidad_por_caja,
            cantidad_fraccion,
            cantidad_total,
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
        const categoriasValidas = ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'];
        if (categoria_ingreso && !categoriasValidas.includes(categoria_ingreso)) {
            return reply.status(400).send({
                success: false,
                error: 'Categoría de ingreso inválida'
            });
        }

        const nuevoProducto = productoRepo.create({
            codigo,
            descripcion,
            stock_actual: stock_actual || 0,
            proveedor,
            tipo_documento: tipo_documento || null,
            numero_documento: numero_documento || null,
            registro_sanitario: registro_sanitario || null,
            r_i: r_i || null,
            codigo_gln: codigo_gln || null,
            proveedor_ruc: proveedor_ruc || null,
            fecha_ingreso: fecha_ingreso || null,
            codigo_interno: codigo_interno || null,
            lote: lote || null,
            fabricante: fabricante || null,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento: fecha_vencimiento || null,
            unidad: unidad || 'UND',
            unidad_otro: unidad_otro || null,
            um: um !== undefined ? um : null,
            temperatura: temperatura !== undefined ? temperatura : 25,
            cantidad_bultos: cantidad_bultos || 0,
            cantidad_cajas: cantidad_cajas || 0,
            cantidad_por_caja: cantidad_por_caja || 0,
            cantidad_fraccion: cantidad_fraccion || 0,
            cantidad_total: cantidad_total || 0,
            observaciones: observaciones || null,
            activo: true
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
                    proveedor: { type: 'string', nullable: true },
                    tipo_documento: { type: 'string', enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'], nullable: true },
                    numero_documento: { type: 'string', nullable: true },
                    registro_sanitario: { type: 'string', nullable: true },
                    r_i: { type: 'string', nullable: true },
                    codigo_gln: { type: 'string', nullable: true },
                    proveedor_ruc: { type: 'string', nullable: true },
                    fecha_ingreso: { type: 'string', format: 'date', nullable: true },
                    codigo_interno: { type: 'string', nullable: true },
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'], nullable: true },
                    procedencia: { type: 'string', nullable: true },
                    fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
                    temperatura: { type: 'number', nullable: true },
                    cantidad_bultos: { type: 'number', nullable: true },
                    cantidad_cajas: { type: 'number', nullable: true },
                    cantidad_por_caja: { type: 'number', nullable: true },
                    cantidad_fraccion: { type: 'number', nullable: true },
                    cantidad_total: { type: 'number', nullable: true },
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
            proveedor,
            tipo_documento,
            numero_documento,
            registro_sanitario,
            r_i,
            codigo_gln,
            proveedor_ruc,
            fecha_ingreso,
            codigo_interno,
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento,
            unidad,
            unidad_otro,
            um,
            temperatura,
            cantidad_bultos,
            cantidad_cajas,
            cantidad_por_caja,
            cantidad_fraccion,
            cantidad_total,
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

        producto.descripcion = descripcion;
        if (activo !== undefined) producto.activo = activo;
        if (proveedor) producto.proveedor = proveedor;
        if (tipo_documento !== undefined) producto.tipo_documento = tipo_documento || null;
        if (numero_documento !== undefined) producto.numero_documento = numero_documento || null;
        if (registro_sanitario !== undefined) producto.registro_sanitario = registro_sanitario || null;
        if (r_i !== undefined) producto.r_i = r_i || null;
        if (codigo_gln !== undefined) producto.codigo_gln = codigo_gln || null;
        if (proveedor_ruc !== undefined) producto.proveedor_ruc = proveedor_ruc || null;
        if (fecha_ingreso !== undefined) producto.fecha_ingreso = fecha_ingreso || null;
        if (codigo_interno !== undefined) producto.codigo_interno = codigo_interno || null;
        if (lote !== undefined) producto.lote = lote || null;
        if (fabricante !== undefined) producto.fabricante = fabricante || null;
        if (categoria_ingreso) producto.categoria_ingreso = categoria_ingreso;
        if (procedencia) producto.procedencia = procedencia;
        if (fecha_vencimiento !== undefined) producto.fecha_vencimiento = fecha_vencimiento || null;
        if (unidad !== undefined) producto.unidad = unidad || 'UND';
        if (unidad_otro !== undefined) producto.unidad_otro = unidad_otro || null;
        if (um !== undefined) producto.um = um || null;
        if (temperatura !== undefined) producto.temperatura = temperatura;
        if (cantidad_bultos !== undefined) producto.cantidad_bultos = cantidad_bultos;
        if (cantidad_cajas !== undefined) producto.cantidad_cajas = cantidad_cajas;
        if (cantidad_por_caja !== undefined) producto.cantidad_por_caja = cantidad_por_caja;
        if (cantidad_fraccion !== undefined) producto.cantidad_fraccion = cantidad_fraccion;
        if (cantidad_total !== undefined) producto.cantidad_total = cantidad_total;
        if (observaciones !== undefined) producto.observaciones = observaciones || null;

        await productoRepo.save(producto);

        return { success: true, data: producto, message: 'Producto actualizado exitosamente' };
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

        producto.activo = false;
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

        // Mapeo por POSICIÓN de columna (independiente del nombre del encabezado)
        const COLUMNAS = [
            'codigo',              // A - col 1 (Cod. Producto)
            'descripcion',         // B - col 2 (Producto)
            'lote',                // C - col 3
            'registro_sanitario',  // D - col 4
            'r_i',                 // E - col 5
            'codigo_gln',          // F - col 6
            'proveedor_ruc',       // G - col 7
            'proveedor',           // H - col 8 (Razón Social)
            'fecha_ingreso',       // I - col 9
            'fecha_vencimiento',   // J - col 10
            'tipo_documento',      // K - col 11
            'numero_documento',    // L - col 12
            'codigo_interno',      // M - col 13
            'unidad',              // N - col 14
            'um',                  // O - col 15
            'cantidad_bultos',     // P - col 16
            'cantidad_cajas',      // Q - col 17
            'cantidad_por_caja',   // R - col 18
            'cantidad_fraccion',   // S - col 19
            'cantidad_total',      // T - col 20
            'fabricante',          // U - col 21
            'procedencia',         // V - col 22
            'observaciones'        // W - col 23
        ];
        const NUMERICAS = ['cantidad_bultos', 'cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion', 'cantidad_total'];

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
            COLUMNAS.forEach((key, i) => {
                let val = values[i + 1];
                // Manejar celdas con objetos rich text de ExcelJS
                if (val && typeof val === 'object' && val.text) val = val.text;
                if (val && typeof val === 'object' && val.result !== undefined) val = val.result;
                // Manejar fechas de Excel
                if (val instanceof Date) {
                    val = val.toISOString().split('T')[0]; // AAAA-MM-DD
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
            if (obj.cantidad_total === null || isNaN(obj.cantidad_total) || obj.cantidad_total < 0) {
                errores.push(`Fila ${rowNumber} (${obj.codigo}): Cant. Total inválida o vacía`);
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

            const [codigo, descripcion, stock_actual] = row.values.slice(1);

            if (!codigo || !descripcion) {
                errores.push(`Fila ${rowNumber}: Código y Descripción son obligatorios`);
                return;
            }

            productos.push({
                codigo: String(codigo),
                descripcion: String(descripcion),
                stock_actual: stock_actual ? Number(stock_actual) : 0,
                activo: true
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
                                cantidad: { type: 'number' },
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
                    stock_actual: prod.cantidad || 0,
                    lote: prod.lote || null,
                    numero_documento: numero_documento,
                    activo: true
                });
                await productoRepo.save(nuevoProducto);
                insertados++;
            } else {
                existente.descripcion = prod.descripcion;
                if (prod.cantidad !== undefined) existente.stock_actual = (existente.stock_actual || 0) + prod.cantidad;
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
        const loteRepo = fastify.db.getRepository('Lote');

        const qb = productoRepo.createQueryBuilder('producto');

        if (busqueda) {
            qb.andWhere(
                '(producto.codigo LIKE :b OR producto.descripcion LIKE :b)',
                { b: `%${busqueda}%` }
            );
        }
        if (categoria_ingreso) {
            qb.andWhere('producto.categoria_ingreso = :cat', { cat: categoria_ingreso });
        }
        if (activo !== undefined) {
            qb.andWhere('producto.activo = :activo', { activo: activo === 'true' });
        }

        qb.orderBy('producto.descripcion', 'ASC');
        const productos = await qb.getMany();

        // Para cada producto, calcular stock real sumando lotes disponibles
        const data = await Promise.all(productos.map(async (p) => {
            const lotes = await loteRepo.find({
                where: { producto_id: p.id },
                order: { fecha_vencimiento: 'ASC' }
            });

            const stockCalculado = lotes.reduce(
                (sum, l) => sum + (parseFloat(l.cantidad_disponible) || 0),
                0
            );

            // Próximo vencimiento: el lote con stock disponible con fecha más próxima
            const proximoLote = lotes.find(
                l => (parseFloat(l.cantidad_disponible) || 0) > 0 && l.fecha_vencimiento
            );

            return {
                id: p.id,
                codigo: p.codigo,
                descripcion: p.descripcion,
                proveedor: p.proveedor || null,
                categoria_ingreso: p.categoria_ingreso || null,
                um: p.um || null,
                unidad: p.unidad || null,
                registro_sanitario: p.registro_sanitario || null,
                stock_minimo: p.stock_minimo || 0,
                stock_calculado: stockCalculado,
                total_lotes: lotes.length,
                proximo_vencimiento: proximoLote ? proximoLote.fecha_vencimiento : null,
                activo: p.activo
            };
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
            queryBuilder.where('producto.activo = :activo', { activo: activo === 'true' });
        }

        const productos = await queryBuilder.orderBy('producto.descripcion', 'ASC').getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 50 },
            { header: 'Stock Actual', key: 'stock_actual', width: 15 },
            { header: 'Activo', key: 'activo', width: 10 }
        ];

        productos.forEach(producto => {
            worksheet.addRow({
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                stock_actual: producto.stock_actual,
                activo: producto.activo ? 'Sí' : 'No'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=productos.xlsx');
        return reply.send(buffer);
    });
}
module.exports = productoRoutes;
