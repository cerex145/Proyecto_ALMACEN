const ExcelJS = require('exceljs');

const ProductoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        codigo: { type: 'string' },
        descripcion: { type: 'string' },
        proveedor: { type: 'string', nullable: true },
        categoria_ingreso: { type: 'string', nullable: true },
        procedencia: { type: 'string', nullable: true },
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
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    procedencia: { type: 'string' },
                    lote: { type: 'string', nullable: true },
                    fecha_vcto: { type: 'string', format: 'date', nullable: true }
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
            categoria_ingreso,
            procedencia,
            lote,
            fecha_vcto
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

        let nuevoProducto = null;

        await fastify.db.transaction(async (manager) => {
            const productoRepoTx = manager.getRepository('Producto');
            const loteRepoTx = manager.getRepository('Lote');
            const kardexRepoTx = manager.getRepository('Kardex');

            nuevoProducto = productoRepoTx.create({
                codigo,
                descripcion,
                stock_actual: stock_actual || 0,
                proveedor,
                categoria_ingreso,
                procedencia,
                activo: true
            });

            await productoRepoTx.save(nuevoProducto);

            // Si hay stock inicial, crear Lote y Kardex
            if (stock_actual && Number(stock_actual) > 0) {
                const numeroLote = lote || `LOTE-INI-${nuevoProducto.id}`;
                
                // Crear Lote
                const nuevoLote = loteRepoTx.create({
                    producto_id: nuevoProducto.id,
                    numero_lote: numeroLote,
                    fecha_vencimiento: fecha_vcto ? new Date(fecha_vcto) : null,
                    stock_lote: Number(stock_actual),
                    activo: true
                });
                await loteRepoTx.save(nuevoLote);

                // Crear Kardex (Inventario Inicial)
                const kardex = kardexRepoTx.create({
                    producto_id: nuevoProducto.id,
                    lote_numero: numeroLote,
                    tipo_movimiento: 'INVENTARIO_INITIAL',
                    cantidad_entrada: Number(stock_actual),
                    saldo: Number(stock_actual), // Saldo inicial
                    documento_tipo: 'REGISTRO_PRODUCTO',
                    documento_numero: 'INI',
                    observaciones: 'Inventario Inicial al crear producto'
                });
                await kardexRepoTx.save(kardex);
            }
        });

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
                    categoria_ingreso: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    procedencia: { type: 'string' }
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
            categoria_ingreso,
            procedencia
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
        if (categoria_ingreso) producto.categoria_ingreso = categoria_ingreso;
        if (procedencia) producto.procedencia = procedencia;

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
