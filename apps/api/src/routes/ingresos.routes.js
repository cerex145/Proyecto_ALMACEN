const ExcelJS = require('exceljs');
const { Like } = require('typeorm');

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
    fastify.get('/api/ingresos', async (request, reply) => {
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
    fastify.get('/api/ingresos/:id', async (request, reply) => {
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
    fastify.post('/api/ingresos', async (request, reply) => {
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
                if (fechaVenc <= hoy) {
                    return reply.status(400).send({
                        success: false,
                        error: 'fecha_vencimiento debe ser mayor a la fecha actual'
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
    fastify.put('/api/ingresos/:id', async (request, reply) => {
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
    fastify.post('/api/ingresos/:id/aprobar', async (request, reply) => {
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
    fastify.post('/api/ingresos/importar', async (request, reply) => {
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
    fastify.get('/api/ingresos/exportar', async (request, reply) => {
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
    fastify.get('/api/ingresos/plantilla/descargar', async (request, reply) => {
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
    fastify.get('/api/ingresos/:id/pdf', async (request, reply) => {
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

        const totalBultos = detalles.reduce((acc, d) => acc + Number(d.cant_bulto || 0), 0);
        const totalCajas = detalles.reduce((acc, d) => acc + Number(d.cant_caja || 0), 0);
        const totalFraccion = detalles.reduce((acc, d) => acc + Number(d.cant_fraccion || 0), 0);
        const totalUnidades = detalles.reduce((acc, d) => acc + Number(d.cantidad || 0), 0);

        // Definición del documento
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [25, 35, 25, 35],
            content: [
                {
                    table: {
                        widths: ['auto', '*', 'auto'],
                        body: [
                            [
                                { text: 'AGUPAL PERU', style: 'brand' },
                                { text: 'NOTA DE INGRESO', style: 'title', alignment: 'center' },
                                { text: `N° ${nota.numero_ingreso || '-'}`, style: 'titleRight', alignment: 'right' }
                            ]
                        ]
                    },
                    layout: 'headerBox',
                    margin: [0, 0, 0, 6]
                },
                {
                    columns: [
                        {
                            width: '*',
                            table: {
                                body: [
                                    [
                                        { text: 'Razón Social', style: 'label' },
                                        { text: nota.cliente?.razon_social || nota.proveedor || '-', style: 'value' }
                                    ],
                                    [
                                        { text: 'Código Cliente', style: 'label' },
                                        { text: nota.cliente?.codigo || nota.cliente_id || '-', style: 'value' }
                                    ],
                                    [
                                        { text: 'RUC', style: 'label' },
                                        { text: nota.cliente?.cuit || '-', style: 'value' }
                                    ],
                                    [
                                        { text: 'Dirección', style: 'label' },
                                        { text: nota.cliente?.direccion || '-', style: 'value' }
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        },
                        {
                            width: 180,
                            table: {
                                body: [
                                    [
                                        { text: 'Fecha de Ingreso', style: 'label' },
                                        { text: new Date(nota.fecha).toLocaleDateString('es-PE'), style: 'value' }
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        }
                    ],
                    margin: [0, 0, 0, 8]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [18, 70, '*', 55, 55, 30, 50, 40, 45, 50, 50, 50, 50],
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
                                String(idx + 1),
                                d.producto?.codigo || '-',
                                d.producto?.descripcion || '-',
                                d.lote_numero || '-',
                                d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-',
                                d.producto?.um || '-',
                                d.producto?.fabricante || '-',
                                (d.producto?.temperatura_min_c != null || d.producto?.temperatura_max_c != null)
                                    ? `${d.producto?.temperatura_min_c ?? '-'} a ${d.producto?.temperatura_max_c ?? '-'}`
                                    : '-',
                                d.cant_bulto ?? '-',
                                d.cant_caja ?? '-',
                                d.cant_por_caja ?? '-',
                                d.cant_fraccion ?? '-',
                                d.cantidad ?? '-'
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 8]
                },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'Motivo de la Salida:', style: 'label' },
                                { text: nota.motivo || '-', style: 'value', margin: [0, 2, 0, 8] },
                                { text: 'Observaciones:', style: 'label' },
                                { text: nota.observaciones || '-', style: 'value' }
                            ]
                        },
                        {
                            width: 220,
                            table: {
                                body: [
                                    [
                                        { text: 'BULTOS', style: 'label' },
                                        { text: String(totalBultos), style: 'value' }
                                    ],
                                    [
                                        { text: 'PALETS', style: 'label' },
                                        { text: '-', style: 'value' }
                                    ],
                                    [
                                        { text: 'FRACCIONES', style: 'label' },
                                        { text: String(totalFraccion), style: 'value' }
                                    ],
                                    [
                                        { text: 'CANTIDAD TOTAL DE UNIDADES', style: 'label' },
                                        { text: String(totalUnidades), style: 'value' }
                                    ]
                                ]
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ],
                    margin: [0, 0, 0, 8]
                },
                {
                    text: 'LEYENDA: Cant. Bulto: N° de cajas selladas (empaque primario)\nCant. Cajas: N° de unidades por caja sellada\nCant. x Caja: N° de unidades por caja sellada\nCant. Fracción: Unidades sueltas\nCant. Total: Total de unidades = (Bultos x Cajas x xCaja) + saldo',
                    style: 'legend',
                    margin: [0, 2, 0, 8]
                },
                {
                    text: `Son ${totalUnidades} unidades en total`,
                    style: 'legend'
                },
                {
                    columns: [
                        { text: '________________________\nJefe de Almacén', alignment: 'center' },
                        { text: '________________________\nVerificado por', alignment: 'center' }
                    ],
                    margin: [0, 25, 0, 0]
                }
            ],
            styles: {
                brand: { fontSize: 10, bold: true, color: '#0b6aa2' },
                title: { fontSize: 11, bold: true },
                titleRight: { fontSize: 9, bold: true },
                label: { fontSize: 7, bold: true },
                value: { fontSize: 7 },
                tableHeader: { fontSize: 7, bold: true, fillColor: '#eeeeee' },
                legend: { fontSize: 6 }
            },
            footer: (currentPage, pageCount) => ({
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'right',
                margin: [0, 0, 30, 0],
                fontSize: 6
            }),
            background: []
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

