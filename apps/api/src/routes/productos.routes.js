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
        lote: { type: 'string', nullable: true },
        fabricante: { type: 'string', nullable: true },
        categoria_ingreso: { type: 'string', nullable: true },
        procedencia: { type: 'string', nullable: true },
        fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
        unidad: { type: 'string', nullable: true },
        unidad_otro: { type: 'string', nullable: true },
        um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
        temperatura_min_c: { type: 'number', nullable: true },
        temperatura_max_c: { type: 'number', nullable: true },
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
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'], nullable: true },
                    procedencia: { type: 'string', nullable: true },
                    fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
                    temperatura_min_c: { type: 'number', nullable: true },
                    temperatura_max_c: { type: 'number', nullable: true },
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
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento,
            unidad,
            unidad_otro,
            um,
            temperatura_min_c,
            temperatura_max_c,
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
            lote: lote || null,
            fabricante: fabricante || null,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento: fecha_vencimiento || null,
            unidad: unidad || 'UND',
            unidad_otro: unidad_otro || null,
            um: um !== undefined ? um : null,
            temperatura_min_c: temperatura_min_c !== undefined ? temperatura_min_c : null,
            temperatura_max_c: temperatura_max_c !== undefined ? temperatura_max_c : null,
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
                    lote: { type: 'string', nullable: true },
                    fabricante: { type: 'string', nullable: true },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'], nullable: true },
                    procedencia: { type: 'string', nullable: true },
                    fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
                    unidad: { type: 'string', nullable: true },
                    unidad_otro: { type: 'string', nullable: true },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND'], nullable: true },
                    temperatura_min_c: { type: 'number', nullable: true },
                    temperatura_max_c: { type: 'number', nullable: true },
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
            lote,
            fabricante,
            categoria_ingreso,
            procedencia,
            fecha_vencimiento,
            unidad,
            unidad_otro,
            um,
            temperatura_min_c,
            temperatura_max_c,
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
        if (lote !== undefined) producto.lote = lote || null;
        if (fabricante !== undefined) producto.fabricante = fabricante || null;
        if (categoria_ingreso) producto.categoria_ingreso = categoria_ingreso;
        if (procedencia) producto.procedencia = procedencia;
        if (fecha_vencimiento !== undefined) producto.fecha_vencimiento = fecha_vencimiento || null;
        if (unidad !== undefined) producto.unidad = unidad || 'UND';
        if (unidad_otro !== undefined) producto.unidad_otro = unidad_otro || null;
        if (um !== undefined) producto.um = um || null;
        if (temperatura_min_c !== undefined) producto.temperatura_min_c = temperatura_min_c;
        if (temperatura_max_c !== undefined) producto.temperatura_max_c = temperatura_max_c;
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

    // POST /api/productos/importar - Importar desde Excel
    fastify.post('/api/productos/importar', {
        schema: {
            tags: ['Productos'],
            description: 'Importar productos desde archivo Excel',
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                required: ['file'],
                properties: {
                    file: { isFileType: true },
                    numero_documento: { type: 'string' }
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
