const ExcelJS = require('exceljs');

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
        um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G'], nullable: true },
        temperatura_c: { type: 'number', nullable: true },
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
            querystring: {
                type: 'object',
                properties: {
                    busqueda: { type: 'string' },
                    activo: { type: 'string', enum: ['true', 'false'] },
                    categoria_ingreso: { type: 'string' },
                    lote: { type: 'string' },
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
            body: {
                type: 'object',
                required: ['codigo', 'descripcion'],
                properties: {
                    codigo: { type: 'string' },
                    descripcion: { type: 'string' },
                    stock_actual: { type: 'number' },
                    proveedor: { type: 'string' },
                    tipo_documento: { type: 'string', enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'] },
                    numero_documento: { type: 'string' },
                    registro_sanitario: { type: 'string' },
                    lote: { type: 'string' },
                    fabricante: { type: 'string' },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    procedencia: { type: 'string' },
                    fecha_vencimiento: { type: 'string', format: 'date' },
                    unidad: { type: 'string' },
                    unidad_otro: { type: 'string' },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G'] },
                    temperatura_c: { type: 'number' },
                    cantidad_bultos: { type: 'number' },
                    cantidad_cajas: { type: 'number' },
                    cantidad_por_caja: { type: 'number' },
                    cantidad_fraccion: { type: 'number' },
                    cantidad_total: { type: 'number' },
                    observaciones: { type: 'string' }
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
            temperatura_c,
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
            temperatura_c: temperatura_c !== undefined ? temperatura_c : null,
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
                    proveedor: { type: 'string' },
                    tipo_documento: { type: 'string', enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'] },
                    numero_documento: { type: 'string' },
                    registro_sanitario: { type: 'string' },
                    lote: { type: 'string' },
                    fabricante: { type: 'string' },
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    procedencia: { type: 'string' },
                    fecha_vencimiento: { type: 'string', format: 'date' },
                    unidad: { type: 'string' },
                    unidad_otro: { type: 'string' },
                    um: { type: 'string', enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G'] },
                    temperatura_c: { type: 'number' },
                    cantidad_bultos: { type: 'number' },
                    cantidad_cajas: { type: 'number' },
                    cantidad_por_caja: { type: 'number' },
                    cantidad_fraccion: { type: 'number' },
                    cantidad_total: { type: 'number' },
                    observaciones: { type: 'string' }
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
            temperatura_c,
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
        if (temperatura_c !== undefined) producto.temperatura_c = temperatura_c;
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
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                required: ['file'],
                properties: {
                    file: { type: 'string', format: 'binary' }
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
        const data = await request.file();
        
        if (!data) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        const buffer = await data.toBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
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
                await productoRepo.save(productoRepo.create(productoData));
                insertados++;
            } else {
                existente.descripcion = productoData.descripcion;
                await productoRepo.save(existente);
                actualizados++;
            }
        }

        return { 
            success: true, 
            message: `Importación completada: ${insertados} insertados, ${actualizados} actualizados` 
        };
    });

    // GET /api/productos/exportar - Exportar a Excel
    fastify.get('/api/productos/exportar', {
        schema: {
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
