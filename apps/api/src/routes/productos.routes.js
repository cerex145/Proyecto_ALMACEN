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
            'codigo',            // A - col 1
            'descripcion',       // B - col 2
            'lote',              // C - col 3
            'fabricante',        // D - col 4
            'fecha_vencimiento', // E - col 5
            'um',                // F - col 6
            'temperatura_min_c', // G - col 7
            'temperatura_max_c', // H - col 8
            'cantidad_bultos',   // I - col 9
            'cantidad_cajas',    // J - col 10
            'cantidad_por_caja', // K - col 11
            'cantidad_fraccion', // L - col 12
            'cantidad_total',    // M - col 13
            'observaciones',     // N - col 14
        ];
        const NUMERICAS = ['temperatura_min_c', 'temperatura_max_c', 'cantidad_bultos', 'cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion', 'cantidad_total'];

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

    // GET /api/productos/plantilla - Descargar plantilla Excel para carga masiva
    fastify.get('/api/productos/plantilla', {
        schema: {
            tags: ['Productos'],
            description: 'Descargar plantilla Excel lista para llenar (carga masiva)'
        }
    }, async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Almacén';
        workbook.created = new Date();

        const ws = workbook.addWorksheet('Productos', {
            views: [{ state: 'frozen', ySplit: 3 }] // congelar las 3 primeras filas
        });

        // ── Colores ──
        const AZUL_OSCURO = '1E3A5F';
        const AZUL_CLARO = 'D6E4F0';
        const VERDE = '1A7A4A';
        const AMARILLO = 'FFF3CD';
        const GRIS_CLARO = 'F5F5F5';

        // ── Fila 1: Título / instrucciones ──
        ws.mergeCells('A1:N1');
        const titCell = ws.getCell('A1');
        titCell.value = '📋  PLANTILLA DE CARGA MASIVA DE PRODUCTOS — Complete los datos desde la FILA 4 en adelante. Las primeras 3 filas NO se deben modificar.';
        titCell.font = { bold: true, color: { argb: 'FF' + AZUL_OSCURO }, size: 11 };
        titCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + AZUL_CLARO } };
        titCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        ws.getRow(1).height = 36;

        // ── Fila 2: Sub-instrucciones por columna ──
        const instrucciones = [
            'Ej: MED-001',
            'Nombre completo del producto',
            'Número de lote\n(Opcional)',
            'Laboratorio fabricante\n(Opcional)',
            'Formato:\nAÑO-MES-DÍA\n(Opcional)',
            'UND / AMP / FRS\n/ CJ / KG / G\n/ BLT / TUB / SOB',
            'Temp. mínima\nen °C\n(Opcional)',
            'Temp. máxima\nen °C\n(Opcional)',
            'Número de\nbultos\n(Opcional)',
            'Número de\ncajas\n(Opcional)',
            'Unidades\npor caja\n(Opcional)',
            'Cantidad\nfraccionada\n(Opcional)',
            '⭐ OBLIGATORIO\nTotal de\nunidades',
            'Notas extra\n(Opcional)'
        ];
        const instrRow = ws.getRow(2);
        instrRow.height = 52;
        instrucciones.forEach((txt, i) => {
            const cell = instrRow.getCell(i + 1);
            cell.value = txt;
            cell.font = { italic: true, color: { argb: 'FF555555' }, size: 8 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
            cell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } } };
        });

        // ── Fila 3: Encabezados principales ──
        const columnas = [
            { header: 'CÓDIGO\nPRODUCTO *', key: 'codigo', width: 16 },
            { header: 'DESCRIPCIÓN\nDEL PRODUCTO *', key: 'descripcion', width: 36 },
            { header: 'LOTE', key: 'lote', width: 16 },
            { header: 'FABRICANTE', key: 'fabricante', width: 22 },
            { header: 'FECHA DE\nVENCIMIENTO', key: 'fecha_vencimiento', width: 15 },
            { header: 'UM\n(Unidad)', key: 'um', width: 10 },
            { header: 'TEMP.\nMÍN °C', key: 'temperatura_min_c', width: 10 },
            { header: 'TEMP.\nMÁX °C', key: 'temperatura_max_c', width: 10 },
            { header: 'CANT.\nBULTOS', key: 'cantidad_bultos', width: 11 },
            { header: 'CANT.\nCAJAS', key: 'cantidad_cajas', width: 11 },
            { header: 'UNID.\nPOR CAJA', key: 'cantidad_por_caja', width: 11 },
            { header: 'CANT.\nFRACCIÓN', key: 'cantidad_fraccion', width: 11 },
            { header: '⭐ CANT.\nTOTAL *', key: 'cantidad_total', width: 13 },
            { header: 'OBSERVACIONES', key: 'observaciones', width: 28 },
        ];

        ws.columns = columnas.map(c => ({ key: c.key, width: c.width }));

        const headerRow = ws.getRow(3);
        headerRow.height = 40;
        columnas.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + AZUL_OSCURO } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        // ── Columnas obligatorias: resaltar con borde verde ──
        [1, 2, 13].forEach(col => {
            const cell = headerRow.getCell(col);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + VERDE } };
            cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } };
        });

        // ── Filas de ejemplo ──
        const ejemplos = [
            ['MED-001', 'Amoxicilina 500mg x 24 cápsulas', 'L-2024-001', 'Laboratorio Grunenthal', '2026-12-31', 'UND', 2, 8, 2, 10, 50, 5, 505, 'Importación directa'],
            ['MED-002', 'Paracetamol 1g ampolleta 10ml', 'L-2024-087', 'Laboratorio Bayer', '2027-06-15', 'AMP', 2, 8, 1, 5, 100, 0, 500, ''],
            ['INS-003', 'Jeringa desechable 5ml con aguja', 'L-2024-120', 'Insumos Médicos SAC', '2028-03-20', 'UND', '', '', 3, 8, 25, 10, 210, 'Licitación N° 45'],
        ];

        ejemplos.forEach((fila, fi) => {
            const row = ws.getRow(4 + fi);
            row.height = 22;
            fila.forEach((val, ci) => {
                const cell = row.getCell(ci + 1);
                cell.value = val === '' ? null : val;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fi % 2 === 0 ? 'FFFFFFFF' : 'FF' + GRIS_CLARO } };
                cell.border = {
                    top: { style: 'hair' }, bottom: { style: 'hair' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: ci >= 6 ? 'right' : 'left' };
                // Columnas numéricas
                if (ci >= 6 && ci <= 12 && val !== '') {
                    cell.numFmt = '#,##0.00';
                }
            });
        });

        // ── Filas vacías para llenar (fila 7 a 60) ──
        for (let r = 7; r <= 60; r++) {
            const row = ws.getRow(r);
            row.height = 20;
            for (let c = 1; c <= 14; c++) {
                const cell = row.getCell(c);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r % 2 === 0 ? 'FFFAFAFA' : 'FFFFFFFF' } };
                cell.border = {
                    top: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                    bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
                cell.alignment = { vertical: 'middle', horizontal: c >= 7 ? 'right' : 'left' };
            }
        }

        // ── Validación: columna UM (F = col 6) dropdown ──
        for (let r = 4; r <= 60; r++) {
            ws.getCell(r, 6).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"UND,AMP,FRS,BLT,TUB,SOB,CJ,KG,G"'],
                showErrorMessage: true,
                errorStyle: 'warning',
                errorTitle: 'Valor no válido',
                error: 'Seleccione UND, AMP, FRS, BLT, TUB, SOB, CJ, KG o G'
            };
        }

        // ── Hoja de ayuda ──
        const wsHelp = workbook.addWorksheet('📖 Instrucciones');
        wsHelp.getColumn(1).width = 28;
        wsHelp.getColumn(2).width = 55;

        const ayuda = [
            ['📋 INSTRUCCIONES DE USO', ''],
            ['', ''],
            ['¿Cómo llenar la plantilla?', 'Complete los datos desde la fila 4 de la hoja "Productos"'],
            ['Columnas con ⭐', 'Son OBLIGATORIAS. Sin ellas el sistema no puede importar el producto.'],
            ['CÓDIGO PRODUCTO', 'Código único. Ej: MED-001, INS-042'],
            ['DESCRIPCIÓN', 'Nombre completo del producto tal como aparece en el sistema'],
            ['LOTE', 'Número de lote del fabricante. Puede dejarse vacío.'],
            ['FABRICANTE', 'Nombre del laboratorio o proveedor del producto'],
            ['FECHA VENCIMIENTO', 'Formato AAAA-MM-DD. Ej: 2026-12-31'],
            ['UM (Unidad Medida)', 'Seleccione de la lista: UND, AMP, FRS, BLT, TUB, SOB, CJ, KG, G'],
            ['TEMP. MÍN / MÁX °C', 'Temperatura de almacenamiento en grados Celsius. Puede estar vacío.'],
            ['CANT. BULTOS', 'Número de bultos recibidos'],
            ['CANT. CAJAS', 'Número de cajas'],
            ['UNID. POR CAJA', 'Unidades contenidas en cada caja'],
            ['CANT. FRACCIÓN', 'Unidades sueltas fuera de caja completa'],
            ['⭐ CANT. TOTAL', 'Total de unidades a ingresar al inventario. OBLIGATORIO.'],
            ['OBSERVACIONES', 'Cualquier nota adicional sobre el producto'],
            ['', ''],
            ['⚠️ IMPORTANTE', 'NO modifique las primeras 3 filas (título, instrucciones, encabezados)'],
            ['⚠️ IMPORTANTE', 'Guarde el archivo sin cambiar su formato (.xlsx)'],
            ['⚠️ IMPORTANTE', 'El Sistema llenará automáticamente: Proveedor, N° Doc, Tipo Doc, etc.'],
        ];

        ayuda.forEach((fila, i) => {
            const row = wsHelp.getRow(i + 1);
            row.height = 22;
            const c1 = row.getCell(1);
            const c2 = row.getCell(2);
            c1.value = fila[0];
            c2.value = fila[1];
            if (i === 0) {
                c1.font = { bold: true, size: 14, color: { argb: 'FF' + AZUL_OSCURO } };
            } else if (fila[0].startsWith('⭐') || fila[0].startsWith('⚠️')) {
                c1.font = { bold: true, color: { argb: 'FFCC0000' } };
                c2.font = { color: { argb: 'FFCC0000' } };
            } else if (fila[0] && fila[0] !== '') {
                c1.font = { bold: true, color: { argb: 'FF' + AZUL_OSCURO } };
            }
            c1.alignment = { vertical: 'middle' };
            c2.alignment = { vertical: 'middle', wrapText: true };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla_carga_masiva.xlsx');
        return reply.send(buffer);
    });
}

module.exports = productoRoutes;
