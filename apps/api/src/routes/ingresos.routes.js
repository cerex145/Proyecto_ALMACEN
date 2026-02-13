const ExcelJS = require('exceljs');
const { Like } = require('typeorm');

// Schemas para documentación Swagger
const NotaIngresoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        numero_ingreso: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        proveedor: { type: 'string' },
        categoria: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
        estado: { type: 'string' },
        observaciones: { type: 'string', nullable: true }
    }
};

const NotaIngresoDetalleSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        nota_ingreso_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        cantidad: { type: 'number' },
        precio_unitario: { type: 'number' },
        lote_numero: { type: 'string', nullable: true },
        fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
        producto: { type: 'object', nullable: true }
    }
};

const NotaIngresoResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: {
            type: 'object',
            properties: {
                ...NotaIngresoSchema.properties,
                detalles: { type: 'array', items: NotaIngresoDetalleSchema }
            }
        }
    }
};

const NotaIngresoResponseWithMessageSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: NotaIngresoSchema,
        message: { type: 'string' }
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
        error: { type: 'string' }
    }
};

async function ingresosRoutes(fastify, options) {
    const notaIngresoRepo = fastify.db.getRepository('NotaIngreso');
    const notaIngresoDetalleRepo = fastify.db.getRepository('NotaIngresoDetalle');
    const productoRepo = fastify.db.getRepository('Producto');
    const loteRepo = fastify.db.getRepository('Lote');
    const kardexRepo = fastify.db.getRepository('Kardex');

    // Generar número único de nota de ingreso
    const generarNumeroIngreso = async () => {
        const ultimaNote = await notaIngresoRepo
            .createQueryBuilder('nota')
            .orderBy('nota.id', 'DESC')
            .limit(1)
            .getOne();

        const numero = ultimaNote ? parseInt(ultimaNote.numero_ingreso) + 1 : 1;
        return String(numero).padStart(8, '0');
    };

    // GET /api/ingresos - Listar notas de ingreso
    fastify.get('/api/ingresos', {
        schema: {
            tags: ['Ingresos'],
            description: 'Listar notas de ingreso con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    fecha_desde: { type: 'string', format: 'date' },
                    fecha_hasta: { type: 'string', format: 'date' },
                    proveedor: { type: 'string' },
                    categoria: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    estado: { type: 'string' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 50 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: NotaIngresoSchema },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            busqueda = '',
            estado,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 50,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = notaIngresoRepo.createQueryBuilder('nota');

        if (busqueda) {
            queryBuilder.where(
                '(nota.numero_ingreso LIKE :busqueda OR nota.proveedor LIKE :busqueda)',
                { busqueda: `%${busqueda}%` }
            );
        }

        if (estado) {
            queryBuilder.andWhere('nota.estado = :estado', { estado });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('nota.fecha >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('nota.fecha <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder
            .orderBy(`nota.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [notas, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: notas,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/ingresos/:id - Obtener nota con detalles
    fastify.get('/api/ingresos/:id', {
        schema: {
            tags: ['Ingresos'],
            description: 'Obtener una nota de ingreso específica con sus detalles',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: NotaIngresoResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const nota = await notaIngresoRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de ingreso no encontrada' });
        }

        const detalles = await notaIngresoDetalleRepo.find({
            where: { nota_ingreso_id: Number(id) },
            relations: ['producto']
        });

        return {
            success: true,
            data: {
                ...nota,
                detalles
            }
        };
    });

    // POST /api/ingresos - Crear nota de ingreso
    fastify.post('/api/ingresos', {
        schema: {
            tags: ['Ingresos'],
            description: 'Crear una nueva nota de ingreso con sus detalles',
            body: {
                type: 'object',
                required: ['fecha', 'proveedor', 'categoria', 'detalles'],
                properties: {
                    fecha: { type: 'string', format: 'date' },
                    proveedor: { type: 'string' },
                    categoria: { type: 'string', enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'] },
                    observaciones: { type: 'string' },
                    detalles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['producto_id', 'cantidad', 'precio_unitario'],
                            properties: {
                                producto_id: { type: 'integer' },
                                cantidad: { type: 'number', minimum: 0 },
                                precio_unitario: { type: 'number', minimum: 0 },
                                lote_numero: { type: 'string' },
                                fecha_vencimiento: { type: 'string', format: 'date' }
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
                        data: NotaIngresoSchema,
                        message: { type: 'string' }
                    }
                },
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const {
            fecha,
            proveedor,
            tipo_documento,
            numero_documento,
            responsable_id,
            detalles,
            observaciones
        } = request.body;

        // Validaciones
        if (!fecha || !proveedor || !detalles || detalles.length === 0) {
            return reply.status(400).send({
                success: false,
                error: 'Fecha, proveedor y detalles son obligatorios'
            });
        }

        try {
            const numeroIngreso = await generarNumeroIngreso();

            // Validar detalles
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            for (const detalle of detalles) {
                if (!detalle.producto_id || !detalle.cantidad || Number(detalle.cantidad) <= 0) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Cada detalle debe incluir producto_id y cantidad > 0'
                    });
                }
                if (!detalle.lote_numero) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Cada detalle debe incluir lote_numero'
                    });
                }
                if (!detalle.fecha_vencimiento) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Cada detalle debe incluir fecha_vencimiento'
                    });
                }

                const fechaVenc = new Date(detalle.fecha_vencimiento);
                if (Number.isNaN(fechaVenc.getTime())) {
                    return reply.status(400).send({
                        success: false,
                        error: 'fecha_vencimiento no es válida'
                    });
                }
            }

            // Crear nota
            const nota = notaIngresoRepo.create({
                numero_ingreso: numeroIngreso,
                fecha,
                proveedor,
                tipo_documento: tipo_documento || null,
                numero_documento: numero_documento || null,
                responsable_id,
                observaciones,
                estado: 'REGISTRADA'
            });

            // Iniciar transacción
            await fastify.db.transaction(async (transactionalEntityManager) => {
                const notaGuardada = await transactionalEntityManager.save('NotaIngreso', nota);

                // Crear detalles y lotes
                for (const detalle of detalles) {
                    // Verificar producto (re-fetch inside transaction if needed, but for now using repo is okay if concurrent modification is low risk, 
                    // or use transactionalEntityManager.findOne to be safe)
                    // We need to fetch product again to ensure we have latest stock if we want to be strict, or just trust the check above?
                    // The loop above didn't fetching product! It fetched inside loop.

                    const producto = await transactionalEntityManager.findOne('Producto', { where: { id: Number(detalle.producto_id) } });
                    if (!producto) {
                        throw new Error(`Producto ${detalle.producto_id} no encontrado`);
                    }

                    // Crear detalle
                    const detalleNota = notaIngresoDetalleRepo.create({
                        nota_ingreso_id: notaGuardada.id,
                        producto_id: detalle.producto_id,
                        lote_numero: detalle.lote_numero,
                        fecha_vencimiento: detalle.fecha_vencimiento,
                        cantidad: detalle.cantidad,
                        precio_unitario: detalle.precio_unitario
                    });
                    await transactionalEntityManager.save('NotaIngresoDetalle', detalleNota);

                    // Crear lote
                    const lote = loteRepo.create({
                        producto_id: detalle.producto_id,
                        numero_lote: detalle.lote_numero,
                        fecha_vencimiento: detalle.fecha_vencimiento,
                        cantidad_ingresada: detalle.cantidad,
                        cantidad_disponible: detalle.cantidad,
                        nota_ingreso_id: notaGuardada.id
                    });
                    await transactionalEntityManager.save('Lote', lote);

                    // Actualizar stock del producto
                    producto.stock_actual = Number(producto.stock_actual) + Number(detalle.cantidad);
                    await transactionalEntityManager.save('Producto', producto);

                    // Registrar en kardex
                    const movimiento = kardexRepo.create({
                        producto_id: detalle.producto_id,
                        lote_numero: detalle.lote_numero,
                        tipo_movimiento: 'INGRESO',
                        cantidad: detalle.cantidad,
                        saldo: producto.stock_actual,
                        documento_tipo: 'NOTA_INGRESO',
                        documento_numero: numeroIngreso,
                        referencia_id: notaGuardada.id
                    });
                    await transactionalEntityManager.save('Kardex', movimiento);
                }

                // Assign to outer variable to return?
                // Verify if we can access notaGuardada outside? 
                // We should return reply here or let it finish.
                // We can't access notaGuardada easily if defined inside. 
                // Let's modify the code structure to define notaGuardada outside or return it.
                // Or just rely on 'nota' being updated? save() updates the object.
                // Yes, `nota` will have `id`.
            });

            return reply.status(201).send({
                success: true,
                data: nota,
                message: 'Nota de ingreso creada exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // PUT /api/ingresos/:id - Actualizar nota de ingreso
    fastify.put('/api/ingresos/:id', {
        schema: {
            tags: ['Ingresos'],
            description: 'Actualizar una nota de ingreso existente',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: NotaIngresoResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { fecha, proveedor, tipo_documento, numero_documento, estado, observaciones } = request.body;

        const nota = await notaIngresoRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de ingreso no encontrada' });
        }

        if (fecha) nota.fecha = fecha;
        if (proveedor) nota.proveedor = proveedor;
        if (tipo_documento !== undefined) nota.tipo_documento = tipo_documento || null;
        if (numero_documento !== undefined) nota.numero_documento = numero_documento || null;
        if (estado) nota.estado = estado;
        if (observaciones) nota.observaciones = observaciones;

        await notaIngresoRepo.save(nota);

        return {
            success: true,
            data: nota,
            message: 'Nota actualizada exitosamente'
        };
    });

    // POST /api/ingresos/:id/aprobar - Aprobar nota
    fastify.post('/api/ingresos/:id/aprobar', {
        schema: {
            tags: ['Ingresos'],
            description: 'Aprobar una nota de ingreso',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: NotaIngresoResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const nota = await notaIngresoRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de ingreso no encontrada' });
        }

        nota.estado = 'RECIBIDA_CONFORME';
        await notaIngresoRepo.save(nota);

        return {
            success: true,
            data: nota,
            message: 'Nota aprobada exitosamente'
        };
    });

    // POST /api/ingresos/importar - Importar desde Excel
    fastify.post('/api/ingresos/importar', {
        schema: {
            tags: ['Ingresos'],
            description: 'Importar notas de ingreso desde archivo Excel',
            consumes: ['multipart/form-data'],
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

        try {
            const buffer = await data.toBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const ingresos = [];
            const errores = [];

            let detallesActuales = [];
            let notaActual = null;

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header

                const [fecha, proveedor, responsable, codigo_producto, lote, fecha_vencimiento, cantidad, precio] = row.values.slice(1);

                // Validaciones básicas
                if (!fecha || !proveedor || !codigo_producto || !cantidad) {
                    errores.push(`Fila ${rowNumber}: Faltan datos obligatorios`);
                    return;
                }

                detallesActuales.push({
                    fecha: new Date(fecha),
                    proveedor,
                    responsable_id: responsable ? Number(responsable) : 1,
                    codigo_producto: String(codigo_producto),
                    lote_numero: String(lote),
                    fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
                    cantidad: Number(cantidad),
                    precio_unitario: precio ? Number(precio) : null
                });
            });

            if (errores.length > 0) {
                return reply.status(400).send({ success: false, errores });
            }

            // Procesar ingresos
            let generados = 0;
            for (const detalle of detallesActuales) {
                const producto = await productoRepo.findOneBy({ codigo: detalle.codigo_producto });
                if (!producto) {
                    errores.push(`Producto ${detalle.codigo_producto} no encontrado`);
                    continue;
                }

                const numeroIngreso = await generarNumeroIngreso();
                const nota = notaIngresoRepo.create({
                    numero_ingreso: numeroIngreso,
                    fecha: detalle.fecha,
                    proveedor: detalle.proveedor,
                    responsable_id: detalle.responsable_id,
                    estado: 'REGISTRADA'
                });

                const notaGuardada = await notaIngresoRepo.save(nota);

                // Crear detalle
                const detalleNota = notaIngresoDetalleRepo.create({
                    nota_ingreso_id: notaGuardada.id,
                    producto_id: producto.id,
                    lote_numero: detalle.lote_numero,
                    fecha_vencimiento: detalle.fecha_vencimiento,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario
                });
                await notaIngresoDetalleRepo.save(detalleNota);

                // Crear lote
                const lote = loteRepo.create({
                    producto_id: producto.id,
                    numero_lote: detalle.lote_numero,
                    fecha_vencimiento: detalle.fecha_vencimiento,
                    cantidad_ingresada: detalle.cantidad,
                    cantidad_disponible: detalle.cantidad,
                    nota_ingreso_id: notaGuardada.id
                });
                await loteRepo.save(lote);

                // Actualizar stock
                producto.stock_actual = Number(producto.stock_actual) + Number(detalle.cantidad);
                await productoRepo.save(producto);

                // Kardex
                const movimiento = kardexRepo.create({
                    producto_id: producto.id,
                    lote_numero: detalle.lote_numero,
                    tipo_movimiento: 'INGRESO',
                    cantidad: detalle.cantidad,
                    saldo: producto.stock_actual,
                    documento_tipo: 'NOTA_INGRESO',
                    documento_numero: numeroIngreso,
                    referencia_id: notaGuardada.id
                });
                await kardexRepo.save(movimiento);

                generados++;
            }

            return {
                success: true,
                message: `Importación completada: ${generados} notas generadas`,
                errores: errores.length > 0 ? errores : undefined
            };

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // GET /api/ingresos/exportar - Exportar a Excel
    fastify.get('/api/ingresos/exportar', {
        schema: {
            tags: ['Ingresos'],
            description: 'Exportar notas de ingreso a archivo Excel',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const notas = await notaIngresoRepo
            .createQueryBuilder('nota')
            .orderBy('nota.created_at', 'DESC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Notas de Ingreso');

        worksheet.columns = [
            { header: 'Número Ingreso', key: 'numero_ingreso', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Proveedor', key: 'proveedor', width: 30 },
            { header: 'Estado', key: 'estado', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        notas.forEach(nota => {
            worksheet.addRow({
                numero_ingreso: nota.numero_ingreso,
                fecha: new Date(nota.fecha).toLocaleDateString('es-AR'),
                proveedor: nota.proveedor,
                estado: nota.estado,
                observaciones: nota.observaciones
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=notas-ingreso.xlsx');
        return reply.send(buffer);
    });

    // GET /api/ingresos/plantilla/descargar - Descargar plantilla
    fastify.get('/api/ingresos/plantilla/descargar', {
        schema: {
            tags: ['Ingresos'],
            description: 'Descargar plantilla Excel para importar notas de ingreso',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla Ingreso');

        worksheet.columns = [
            { header: 'Fecha (YYYY-MM-DD)', key: 'fecha', width: 20 },
            { header: 'Proveedor', key: 'proveedor', width: 30 },
            { header: 'Responsable (ID)', key: 'responsable', width: 15 },
            { header: 'Código Producto', key: 'codigo_producto', width: 20 },
            { header: 'Número Lote', key: 'lote', width: 20 },
            { header: 'Fecha Vencimiento (YYYY-MM-DD)', key: 'fecha_vencimiento', width: 25 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Precio Unitario', key: 'precio', width: 15 }
        ];

        // Agregar fila de ejemplo
        worksheet.addRow({
            fecha: '2026-01-30',
            proveedor: 'Proveedor Ejemplo',
            responsable: '1',
            codigo_producto: 'PROD001',
            lote: 'LOTE-2026-001',
            fecha_vencimiento: '2027-01-30',
            cantidad: '100',
            precio: '10.50'
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla-ingreso.xlsx');
        return reply.send(buffer);
    });


    // GET /api/ingresos/:id/pdf - Generar PDF de nota de ingreso
    fastify.get('/api/ingresos/:id/pdf', {
        schema: {
            tags: ['Ingresos'],
            description: 'Generar PDF de una nota de ingreso',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: { type: 'string', format: 'binary' },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const {
            generatePDF
        } = require('../services/pdf.service');

        const nota = await notaIngresoRepo.findOneBy({
            id: Number(id)
        });
        if (!nota) {
            return reply.status(404).send({
                success: false,
                error: 'Nota de ingreso no encontrada'
            });
        }

        const detalles = await notaIngresoDetalleRepo.find({
            where: {
                nota_ingreso_id: Number(id)
            },
            relations: ['producto']
        });

        // Calcular totales para el footer
        const totalBultos = detalles.reduce((acc, d) => acc + Number(d.cantidad_bultos || 0), 0);
        const totalCajas = detalles.reduce((acc, d) => acc + Number(d.cantidad_cajas || 0), 0);
        const totalFraccion = detalles.reduce((acc, d) => acc + Number(d.cantidad_fraccion || 0), 0);
        const totalUnidades = detalles.reduce((acc, d) => acc + Number(d.cantidad_total || d.cantidad || 0), 0);

        // Path del logo (si existe)
        const logoPath = require('path').join(__dirname, '../assets/logo.png');
        const fs = require('fs');
        let logoImage = null;
        if (fs.existsSync(logoPath)) {
            logoImage = {
                image: logoPath,
                width: 150
            };
        } else {
            logoImage = { text: 'AGUPAL PERU', style: 'brand', fontSize: 20 };
        }

        // Definición del documento
        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape', // La imagen parece ancha, cambiamos a landscape? No, la imagen es vertical (A4 portrait usualmente) pero la tabla es ancha.
            // La imagen referencial tiene aspecto muy horizontal. "Página 1 de 1" abajo a la derecha. 
            // Parece A4 Horizontal (Landscape) por la cantidad de columnas.
            pageMargins: [20, 20, 20, 20],
            content: [
                // Encabezado
                {
                    columns: [
                        logoImage,
                        { text: 'NOTA DE INGRESO', style: 'headerTitle', alignment: 'center', margin: [0, 10, 0, 0] },
                        { text: `N° ${Number(nota.numero_ingreso)}`, style: 'headerNumber', alignment: 'right', margin: [0, 10, 0, 0] }
                    ],
                    margin: [0, 0, 0, 10]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 1 }] },

                // Datos Cliente e Ingreso
                {
                    columns: [
                        {
                            width: '60%',
                            stack: [
                                {
                                    columns: [
                                        { text: 'Razón Social :', width: 80, style: 'labelBold' },
                                        { text: nota.proveedor || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Código Cliente :', width: 80, style: 'labelBold' },
                                        { text: 'CLI-2241-001', style: 'labelText' } // Mock o dato real si existiera
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'RUC :', width: 80, style: 'labelBold' },
                                        { text: '20605712241', style: 'labelText' } // Mock o dato real
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Dirección :', width: 80, style: 'labelBold' },
                                        { text: 'JR. DIANA INT.11,MZ.D2,LT.25,1 Y 2 PIS URB.SANTA MARIA DE SURCO', style: 'labelText' } // Mock
                                    ]
                                }
                            ],
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '40%',
                            stack: [
                                {
                                    columns: [
                                        { text: 'Fecha de Ingreso:', width: '*', alignment: 'right', style: 'labelBold' },
                                        { text: new Date(nota.fecha).toLocaleDateString('es-PE'), width: 100, alignment: 'right', style: 'labelText' }
                                    ]
                                }
                            ],
                            margin: [0, 10, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },

                // Tabla de Productos
                {
                    table: {
                        headerRows: 1,
                        widths: [20, 60, '*', 50, 50, 25, 80, 50, 40, 40, 40, 50, 50],
                        body: [
                            [
                                { text: 'Item', style: 'tableHeader' },
                                { text: 'Cod.Producto', style: 'tableHeader' },
                                { text: 'Producto', style: 'tableHeader' },
                                { text: 'Lote', style: 'tableHeader' },
                                { text: 'Fecha Vcto', style: 'tableHeader' },
                                { text: 'UM', style: 'tableHeader' },
                                { text: 'Fabri.', style: 'tableHeader' },
                                { text: 'Temp.', style: 'tableHeader' },
                                { text: 'Cant.Bulto', style: 'tableHeader' },
                                { text: 'Cant.Cajas', style: 'tableHeader' },
                                { text: 'Cant.x Caja', style: 'tableHeader' },
                                { text: 'Cant.Fracción', style: 'tableHeader' },
                                { text: 'Cant.Total', style: 'tableHeader' }
                            ],
                            ...detalles.map((d, idx) => [
                                { text: String(idx + 1), style: 'tableCell' },
                                { text: d.producto?.codigo || '-', style: 'tableCell' },
                                { text: d.producto?.descripcion || '-', style: 'tableCell', alignment: 'left' },
                                { text: d.lote_numero || '-', style: 'tableCell' },
                                { text: d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-', style: 'tableCell' },
                                { text: d.producto?.unidad || 'UND', style: 'tableCell' },
                                { text: d.producto?.fabricante || '-', style: 'tableCell' },
                                { text: (d.producto?.temperatura_min_c != null) ? `${d.producto.temperatura_min_c}° ${d.producto.temperatura_max_c}°C` : '-', style: 'tableCell' },
                                { text: parseFloat(d.cantidad_bultos || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cantidad_cajas || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cantidad_por_caja || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cantidad_fraccion || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cantidad_total || d.cantidad).toFixed(2), style: 'tableCell' }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) { return 1; },
                        vLineWidth: function (i, node) { return 1; },
                        hLineColor: function (i, node) { return 'black'; },
                        vLineColor: function (i, node) { return 'black'; },
                        paddingLeft: function (i, node) { return 2; },
                        paddingRight: function (i, node) { return 2; },
                    }
                },

                // Footer
                {
                    columns: [
                        // Columna Izquierda (Motivos, Observaciones, Leyenda)
                        {
                            width: '*',
                            stack: [
                                {
                                    text: [
                                        { text: 'Motivo de la Salida:\n', bold: true, decoration: 'underline' },
                                        { text: '(Describir causa)' } // No tenemos campo motivo salida en ingreso
                                    ],
                                    margin: [0, 5, 0, 5]
                                },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5 }] },
                                {
                                    text: [
                                        { text: 'Observaciones:\n', bold: true, decoration: 'underline' },
                                        { text: nota.observaciones || '(Condiciones, daños, etc.)' }
                                    ],
                                    margin: [0, 5, 0, 5]
                                },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5 }] },
                                {
                                    text: [
                                        { text: 'LEYENDA: ', bold: true },
                                        'Cant. Bulto: N° de cajas selladas (empaque primario)\n',
                                        { text: 'Cant. Cajas: ', bold: true }, 'N° de unidades por caja sellada\n',
                                        { text: 'Cant. x Caja: ', bold: true }, 'N° de unidades por caja abierta\n',
                                        { text: 'Cant. Fracción: ', bold: true }, 'Unidades sueltas\n',
                                        { text: 'Cant. Total: ', bold: true }, 'Total de unidades = (Bultos x Cajas x xCaja) + Saldo'
                                    ],
                                    style: 'legend',
                                    margin: [0, 5, 0, 0]
                                },
                                {
                                    text: `Son ${totalUnidades} unidades en total`,
                                    style: 'legend',
                                    margin: [0, 5, 0, 0]
                                },
                                {
                                    text: '(Resultado de sumar las unidades contenidas en los bultos, las cajas sueltas y las fracciones.)',
                                    style: 'legend',
                                    italics: true,
                                    color: 'gray'
                                }
                            ]
                        },
                        // Columna Derecha (Totales Grid)
                        {
                            width: 250,
                            table: {
                                widths: ['50%', '50%'],
                                body: [
                                    [
                                        { text: 'BULTOS', style: 'footerGridHeader' },
                                        { text: 'PALETS', style: 'footerGridHeader' }
                                    ],
                                    [
                                        { text: parseFloat(totalBultos).toFixed(2), style: 'footerGridValue', minHeight: 40 },
                                        { text: '', style: 'footerGridValue', minHeight: 40 }
                                    ],
                                    [
                                        { text: 'FRACCIONES', style: 'footerGridHeader' },
                                        { text: 'CANTIDAD TOTAL DE UNIDADES', style: 'footerGridHeader' }
                                    ],
                                    [
                                        { text: parseFloat(totalFraccion).toFixed(2), style: 'footerGridValue', minHeight: 40 },
                                        { text: parseFloat(totalUnidades).toFixed(2), style: 'footerGridValue', minHeight: 40 }
                                    ]
                                ]
                            }
                        }
                    ],
                    margin: [0, 10, 0, 0]
                },

                // Firmas
                {
                    columns: [
                        { stack: [{ text: '________________________' }, { text: 'Jefe de Almacén' }], alignment: 'center' },
                        { stack: [{ text: '________________________' }, { text: 'Verificado por' }], alignment: 'center' }
                    ],
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: {
                brand: { fontSize: 18, bold: true, color: '#0b6aa2' },
                headerTitle: { fontSize: 14, bold: true },
                headerNumber: { fontSize: 12, bold: true },
                labelBold: { fontSize: 8, bold: true },
                labelText: { fontSize: 8 },
                tableHeader: { fontSize: 7, bold: true, color: 'white', fillColor: 'black', alignment: 'center' },
                tableCell: { fontSize: 7, alignment: 'center' },
                footerGridHeader: { fontSize: 7, bold: true, fillColor: '#ffffff' },
                footerGridValue: { fontSize: 9, bold: true, alignment: 'center', margin: [0, 5, 0, 0] },
                legend: { fontSize: 6 }
            }
        };

        try {
            const buffer = await generatePDF(docDefinition);
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `inline; filename=ingreso-${nota.numero_ingreso}.pdf`);
            return reply.send(buffer);
        } catch (error) {
            console.error('Error generando PDF:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error al generar el PDF'
            });
        }
    });

}

module.exports = ingresosRoutes;

