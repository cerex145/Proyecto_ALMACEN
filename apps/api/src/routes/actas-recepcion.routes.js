const ExcelJS = require('exceljs');
const { generatePDF } = require('../services/pdf.service');

// Schemas para documentación Swagger
const ActaRecepcionSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        numero_acta: { type: 'string' },
        nota_ingreso_id: { type: 'integer' },
        fecha_recepcion: { type: 'string', format: 'date' },
        responsable_id: { type: 'integer', nullable: true },
        estado: { type: 'string', enum: ['CONFORME', 'OBSERVADO'] },
        observaciones: { type: 'string', nullable: true },
        aprobado: { type: 'boolean' }
    }
};

const ActaRecepcionDetalleSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        acta_recepcion_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote_numero: { type: 'string', nullable: true },
        cantidad_esperada: { type: 'number' },
        cantidad_recibida: { type: 'number' },
        conforme: { type: 'boolean' },
        observaciones: { type: 'string', nullable: true },
        producto: { type: 'object', nullable: true }
    }
};

const ActaRecepcionResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: {
            type: 'object',
            properties: {
                ...ActaRecepcionSchema.properties,
                detalles: { type: 'array', items: ActaRecepcionDetalleSchema },
                notaIngreso: { type: 'object', nullable: true }
            }
        }
    }
};

const ActaRecepcionResponseWithMessageSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: ActaRecepcionSchema,
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

async function actasRecepcionRoutes(fastify, options) {
    const actaRecepcionRepo = fastify.db.getRepository('ActaRecepcion');
    const actaRecepcionDetalleRepo = fastify.db.getRepository('ActaRecepcionDetalle');
    const notaIngresoRepo = fastify.db.getRepository('NotaIngreso');
    const notaIngresoDetalleRepo = fastify.db.getRepository('NotaIngresoDetalle');
    const productoRepo = fastify.db.getRepository('Producto');
    const kardexRepo = fastify.db.getRepository('Kardex');

    // Generar número único de acta
    const generarNumeroActa = async () => {
        const ultimaActa = await actaRecepcionRepo
            .createQueryBuilder('acta')
            .orderBy('acta.id', 'DESC')
            .limit(1)
            .getOne();

        const numero = ultimaActa ? parseInt(ultimaActa.numero_acta) + 1 : 1;
        return String(numero).padStart(8, '0');
    };

    // GET /api/actas-recepcion - Listar actas
    fastify.get('/api/actas-recepcion', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Listar actas de recepción con filtros',
            querystring: {
                type: 'object',
                properties: {
                    estado: { type: 'string', enum: ['CONFORME', 'OBSERVADO'] },
                    aprobado: { type: 'boolean' },
                    fecha_desde: { type: 'string', format: 'date' },
                    fecha_hasta: { type: 'string', format: 'date' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 50 },
                    orderBy: { type: 'string', default: 'created_at' },
                    order: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: ActaRecepcionSchema },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            estado,
            aprobado,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 50,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = actaRecepcionRepo.createQueryBuilder('acta');

        if (estado) {
            queryBuilder.where('acta.estado = :estado', { estado });
        }

        if (aprobado !== undefined) {
            queryBuilder.andWhere('acta.aprobado = :aprobado', { aprobado: aprobado === 'true' });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('acta.fecha_recepcion >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('acta.fecha_recepcion <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder
            .orderBy(`acta.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [actas, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: actas,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/actas-recepcion/:id - Obtener acta con detalles
    fastify.get('/api/actas-recepcion/:id', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Obtener un acta de recepción específica con sus detalles',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ActaRecepcionResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const acta = await actaRecepcionRepo.findOneBy({ id: Number(id) });
        if (!acta) {
            return reply.status(404).send({ success: false, error: 'Acta de recepción no encontrada' });
        }

        const detalles = await actaRecepcionDetalleRepo.find({
            where: { acta_recepcion_id: Number(id) }
        });

        // Obtener nota de ingreso asociada
        const notaIngreso = await notaIngresoRepo.findOneBy({ id: acta.nota_ingreso_id });

        return {
            success: true,
            data: {
                ...acta,
                detalles,
                notaIngreso
            }
        };
    });

    // POST /api/actas-recepcion - Crear acta
    fastify.post('/api/actas-recepcion', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Crear una nueva acta de recepción',
            body: {
                type: 'object',
                required: ['nota_ingreso_id', 'fecha_recepcion', 'detalles'],
                properties: {
                    nota_ingreso_id: { type: 'integer' },
                    fecha_recepcion: { type: 'string', format: 'date' },
                    responsable_id: { type: 'integer' },
                    estado: { type: 'string', enum: ['CONFORME', 'OBSERVADO'] },
                    observaciones: { type: 'string' },
                    detalles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['producto_id', 'cantidad_esperada', 'cantidad_recibida'],
                            properties: {
                                producto_id: { type: 'integer' },
                                lote_numero: { type: 'string' },
                                cantidad_esperada: { type: 'number' },
                                cantidad_recibida: { type: 'number' },
                                observaciones: { type: 'string' }
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
                        data: ActaRecepcionSchema,
                        message: { type: 'string' }
                    }
                },
                400: ErrorResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const {
            nota_ingreso_id,
            fecha_recepcion,
            responsable_id,
            estado,
            detalles,
            observaciones
        } = request.body;

        // Validaciones
        if (!nota_ingreso_id || !fecha_recepcion || !detalles || detalles.length === 0) {
            return reply.status(400).send({
                success: false,
                error: 'Nota ingreso, fecha recepción y detalles son obligatorios'
            });
        }

        try {
            // Verificar nota de ingreso
            const notaIngreso = await notaIngresoRepo.findOneBy({ id: Number(nota_ingreso_id) });
            if (!notaIngreso) {
                return reply.status(404).send({ success: false, error: 'Nota de ingreso no encontrada' });
            }

            const numeroActa = await generarNumeroActa();

            // Crear acta
            const acta = actaRecepcionRepo.create({
                numero_acta: numeroActa,
                nota_ingreso_id: Number(nota_ingreso_id),
                fecha_recepcion,
                responsable_id,
                estado: estado || 'CONFORME',
                observaciones,
                aprobado: false
            });

            const actaGuardada = await actaRecepcionRepo.save(acta);

            // Procesar detalles
            let todosConformes = true;
            for (const detalle of detalles) {
                const actaDetalle = actaRecepcionDetalleRepo.create({
                    acta_recepcion_id: actaGuardada.id,
                    producto_id: detalle.producto_id,
                    lote_numero: detalle.lote_numero,
                    cantidad_esperada: detalle.cantidad_esperada,
                    cantidad_recibida: detalle.cantidad_recibida,
                    conforme: detalle.cantidad_recibida === detalle.cantidad_esperada,
                    observaciones: detalle.observaciones
                });

                if (detalle.cantidad_recibida !== detalle.cantidad_esperada) {
                    todosConformes = false;
                }

                await actaRecepcionDetalleRepo.save(actaDetalle);
            }

            // Actualizar estado de la nota ingreso si todos están conformes
            if (todosConformes) {
                notaIngreso.estado = 'RECIBIDA_CONFORME';
            } else {
                notaIngreso.estado = 'RECIBIDA_OBSERVADA';
                acta.estado = 'OBSERVADO';
            }
            await notaIngresoRepo.save(notaIngreso);

            return reply.status(201).send({
                success: true,
                data: actaGuardada,
                message: 'Acta de recepción creada exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // PUT /api/actas-recepcion/:id - Actualizar acta
    fastify.put('/api/actas-recepcion/:id', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Actualizar un acta de recepción existente',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ActaRecepcionResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { estado, observaciones } = request.body;

        const acta = await actaRecepcionRepo.findOneBy({ id: Number(id) });
        if (!acta) {
            return reply.status(404).send({ success: false, error: 'Acta no encontrada' });
        }

        if (estado) acta.estado = estado;
        if (observaciones) acta.observaciones = observaciones;

        await actaRecepcionRepo.save(acta);

        return {
            success: true,
            data: acta,
            message: 'Acta actualizada exitosamente'
        };
    });

    // POST /api/actas-recepcion/:id/aprobar - Aprobar acta
    fastify.post('/api/actas-recepcion/:id/aprobar', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Aprobar un acta de recepción',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ActaRecepcionResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const acta = await actaRecepcionRepo.findOneBy({ id: Number(id) });
        if (!acta) {
            return reply.status(404).send({ success: false, error: 'Acta no encontrada' });
        }

        // Obtener detalles
        const detalles = await actaRecepcionDetalleRepo.find({
            where: { acta_recepcion_id: Number(id) }
        });

        // Procesar ajustes si hay diferencias
        for (const detalle of detalles) {
            const diferencia = Number(detalle.cantidad_recibida) - Number(detalle.cantidad_esperada);

            if (diferencia !== 0) {
                const producto = await productoRepo.findOneBy({ id: detalle.producto_id });

                if (diferencia > 0) {
                    // Ingreso de más productos
                    producto.stock_actual = Number(producto.stock_actual) + diferencia;
                    await kardexRepo.save(kardexRepo.create({
                        producto_id: detalle.producto_id,
                        lote_numero: detalle.lote_numero,
                        tipo_movimiento: 'AJUSTE_POR_RECEPCION',
                        cantidad: diferencia,
                        saldo: producto.stock_actual,
                        documento_tipo: 'ACTA_RECEPCION',
                        documento_numero: acta.numero_acta,
                        referencia_id: acta.id,
                        observaciones: `Ajuste por diferencia en recepción`
                    }));
                } else if (diferencia < 0) {
                    // Recepción de menos productos
                    producto.stock_actual = Number(producto.stock_actual) + diferencia;
                    await kardexRepo.save(kardexRepo.create({
                        producto_id: detalle.producto_id,
                        lote_numero: detalle.lote_numero,
                        tipo_movimiento: 'AJUSTE_POR_RECEPCION',
                        cantidad: diferencia,
                        saldo: producto.stock_actual,
                        documento_tipo: 'ACTA_RECEPCION',
                        documento_numero: acta.numero_acta,
                        referencia_id: acta.id,
                        observaciones: `Ajuste por diferencia en recepción`
                    }));
                }

                await productoRepo.save(producto);
            }
        }

        acta.aprobado = true;
        await actaRecepcionRepo.save(acta);

        return {
            success: true,
            data: acta,
            message: 'Acta aprobada exitosamente'
        };
    });

    // POST /api/actas-recepcion/importar - Importar desde Excel
    fastify.post('/api/actas-recepcion/importar', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Importar actas de recepción desde archivo Excel',
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
            const errores = [];
            let generadas = 0;

            worksheet.eachRow(async (row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header

                const [
                    numero_nota_ingreso,
                    fecha_recepcion,
                    responsable,
                    codigo_producto,
                    lote,
                    cantidad_esperada,
                    cantidad_recibida,
                    observaciones
                ] = row.values.slice(1);

                // Validaciones
                if (!numero_nota_ingreso || !fecha_recepcion || !codigo_producto || !cantidad_recibida) {
                    errores.push(`Fila ${rowNumber}: Faltan datos obligatorios`);
                    return;
                }

                try {
                    // Buscar nota de ingreso
                    const notaIngreso = await notaIngresoRepo.findOneBy({
                        numero_ingreso: String(numero_nota_ingreso)
                    });

                    if (!notaIngreso) {
                        errores.push(`Fila ${rowNumber}: Nota de ingreso no encontrada`);
                        return;
                    }

                    const numeroActa = await generarNumeroActa();

                    const acta = actaRecepcionRepo.create({
                        numero_acta: numeroActa,
                        nota_ingreso_id: notaIngreso.id,
                        fecha_recepcion: new Date(fecha_recepcion),
                        responsable_id: responsable ? Number(responsable) : 1,
                        estado: Number(cantidad_recibida) === Number(cantidad_esperada) ? 'CONFORME' : 'OBSERVADO',
                        observaciones
                    });

                    const actaGuardada = await actaRecepcionRepo.save(acta);

                    // Obtener producto
                    const producto = await productoRepo.findOneBy({ codigo: String(codigo_producto) });
                    if (!producto) {
                        errores.push(`Fila ${rowNumber}: Producto no encontrado`);
                        return;
                    }

                    // Crear detalle
                    const detalle = actaRecepcionDetalleRepo.create({
                        acta_recepcion_id: actaGuardada.id,
                        producto_id: producto.id,
                        lote_numero: String(lote),
                        cantidad_esperada: Number(cantidad_esperada),
                        cantidad_recibida: Number(cantidad_recibida),
                        conforme: Number(cantidad_recibida) === Number(cantidad_esperada)
                    });

                    await actaRecepcionDetalleRepo.save(detalle);

                    generadas++;

                } catch (error) {
                    errores.push(`Fila ${rowNumber}: ${error.message}`);
                }
            });

            return {
                success: true,
                message: `Importación completada: ${generadas} actas generadas`,
                errores: errores.length > 0 ? errores : undefined
            };

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // GET /api/actas-recepcion/exportar - Exportar a Excel
    fastify.get('/api/actas-recepcion/exportar', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Exportar actas de recepción a archivo Excel',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const actas = await actaRecepcionRepo
            .createQueryBuilder('acta')
            .leftJoinAndSelect('acta.notaIngreso', 'notaIngreso')
            .orderBy('acta.created_at', 'DESC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Actas de Recepción');

        worksheet.columns = [
            { header: 'Número Acta', key: 'numero_acta', width: 15 },
            { header: 'Número Nota Ingreso', key: 'numero_nota', width: 20 },
            { header: 'Fecha Recepción', key: 'fecha', width: 15 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 40 },
            { header: 'Aprobado', key: 'aprobado', width: 10 }
        ];

        actas.forEach(acta => {
            worksheet.addRow({
                numero_acta: acta.numero_acta,
                numero_nota: acta.notaIngreso ? acta.notaIngreso.numero_ingreso : 'N/A',
                fecha: new Date(acta.fecha_recepcion).toLocaleDateString('es-AR'),
                estado: acta.estado,
                observaciones: acta.observaciones,
                aprobado: acta.aprobado ? 'Sí' : 'No'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=actas-recepcion.xlsx');
        return reply.send(buffer);
    });

    // GET /api/actas-recepcion/plantilla/descargar - Descargar plantilla
    fastify.get('/api/actas-recepcion/plantilla/descargar', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Descargar plantilla Excel para importar actas de recepción',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla Acta');

        worksheet.columns = [
            { header: 'Número Nota Ingreso', key: 'numero_nota', width: 20 },
            { header: 'Fecha Recepción (YYYY-MM-DD)', key: 'fecha_recepcion', width: 25 },
            { header: 'Responsable (ID)', key: 'responsable', width: 15 },
            { header: 'Código Producto', key: 'codigo_producto', width: 20 },
            { header: 'Número Lote', key: 'lote', width: 20 },
            { header: 'Cantidad Esperada', key: 'cantidad_esperada', width: 20 },
            { header: 'Cantidad Recibida', key: 'cantidad_recibida', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        worksheet.addRow({
            numero_nota: '00000001',
            fecha_recepcion: '2026-01-30',
            responsable: '1',
            codigo_producto: 'PROD001',
            lote: 'LOTE-2026-001',
            cantidad_esperada: '100',
            cantidad_recibida: '100',
            observaciones: 'Conforme'
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla-acta.xlsx');
        return reply.send(buffer);
    });

    // GET /api/actas-recepcion/:id/pdf - Exportar PDF
    fastify.get('/api/actas-recepcion/:id/pdf', {
        schema: {
            tags: ['Actas de Recepción'],
            description: 'Generar PDF de un acta de recepción',
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

        const acta = await actaRecepcionRepo.findOne({
            where: { id: Number(id) }
        });

        if (!acta) {
            return reply.status(404).send({ error: 'Acta no encontrada' });
        }

        const detalles = await actaRecepcionDetalleRepo.find({
            where: { acta_recepcion_id: acta.id },
            relations: ['producto']
        });

        const notaIngreso = await notaIngresoRepo.findOneBy({ id: acta.nota_ingreso_id });

        const docDefinition = {
            content: [
                { text: `ACTA DE RECEPCIÓN: ${acta.numero_acta}`, style: 'header' },
                {
                    columns: [
                        { text: `Fecha: ${new Date(acta.fecha_recepcion).toLocaleDateString()}`, bold: true },
                        { text: `Nota Ingreso: ${notaIngreso ? notaIngreso.numero_ingreso : 'N/A'}`, alignment: 'right' }
                    ]
                },
                { text: `Estado: ${acta.estado}  |  Aprobado: ${acta.aprobado ? 'Sí' : 'No'}` },
                acta.observaciones ? { text: `Observaciones: ${acta.observaciones}` } : { text: '' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Producto', style: 'tableHeader' },
                                { text: 'Lote', style: 'tableHeader' },
                                { text: 'Esperado', style: 'tableHeader', alignment: 'right' },
                                { text: 'Recibido', style: 'tableHeader', alignment: 'right' },
                                { text: 'Diferencia', style: 'tableHeader', alignment: 'right' }
                            ],
                            ...detalles.map(d => {
                                const diferencia = Number(d.cantidad_recibida) - Number(d.cantidad_esperada);
                                return [
                                    d.producto ? d.producto.descripcion : 'N/A',
                                    d.lote_numero || '-',
                                    { text: d.cantidad_esperada, alignment: 'right' },
                                    { text: d.cantidad_recibida, alignment: 'right' },
                                    { text: diferencia, alignment: 'right' }
                                ];
                            })
                        ]
                    }
                },
                { text: '\n\n' },
                {
                    columns: [
                        { text: '_______________________\nResponsable', alignment: 'center' },
                        { text: '_______________________\nReceptor', alignment: 'center' }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 12, color: 'black' }
            }
        };

        const buffer = await generatePDF(docDefinition);
        reply.header('Content-Type', 'application/pdf');
        return reply.send(buffer);
    });
}

module.exports = actasRecepcionRoutes;
