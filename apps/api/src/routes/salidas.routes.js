const ExcelJS = require('exceljs');
const { generatePDF } = require('../services/pdf.service');

async function salidasRoutes(fastify, options) {
    const notaSalidaRepo = fastify.db.getRepository('NotaSalida');
    const notaSalidaDetalleRepo = fastify.db.getRepository('NotaSalidaDetalle');
    const productoRepo = fastify.db.getRepository('Producto');
    const clienteRepo = fastify.db.getRepository('Cliente');
    const loteRepo = fastify.db.getRepository('Lote');
    const kardexRepo = fastify.db.getRepository('Kardex');

    // Generar número único de salida
    const generarNumeroSalida = async () => {
        const ultimaSalida = await notaSalidaRepo
            .createQueryBuilder('nota')
            .orderBy('nota.id', 'DESC')
            .limit(1)
            .getOne();

        const numero = ultimaSalida ? parseInt(ultimaSalida.numero_salida) + 1 : 1;
        return String(numero).padStart(8, '0');
    };

    // GET /api/salidas - Listar notas de salida
    fastify.get('/api/salidas', async (request, reply) => {
        const {
            busqueda = '',
            numero_salida,
            cliente_id,
            estado,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 50,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = notaSalidaRepo.createQueryBuilder('nota');

        const terminoBusqueda = busqueda || numero_salida || '';
        if (terminoBusqueda) {
            queryBuilder.where('nota.numero_salida LIKE :busqueda', { busqueda: `%${terminoBusqueda}%` });
        }

        if (cliente_id) {
            queryBuilder.andWhere('nota.cliente_id = :cliente_id', { cliente_id: Number(cliente_id) });
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
            .leftJoinAndMapOne('nota.cliente', 'clientes', 'cliente', 'cliente.id = nota.cliente_id')
            .skip(skip)
            .take(limit);

        const allowedOrderFields = new Set(['created_at', 'fecha', 'estado', 'numero_salida', 'id']);
        const safeOrderBy = allowedOrderFields.has(orderBy) ? orderBy : 'created_at';
        const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        queryBuilder.orderBy(`nota.${safeOrderBy}`, safeOrder);

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

    // GET /api/salidas/:id - Obtener nota con detalles
    fastify.get('/api/salidas/:id', async (request, reply) => {
        const { id } = request.params;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de salida no encontrada' });
        }

        const detalles = await notaSalidaDetalleRepo.find({
            where: { nota_salida_id: Number(id) },
            relations: ['producto']
        });

        const cliente = await clienteRepo.findOneBy({ id: nota.cliente_id });

        return {
            success: true,
            data: {
                ...nota,
                detalles,
                cliente
            }
        };
    });

    // POST /api/salidas - Crear nota de salida
    fastify.post('/api/salidas', async (request, reply) => {
        const {
            cliente_id,
            fecha,
            responsable_id,
            detalles,
            observaciones,
            tipo_documento,
            numero_documento,
            fecha_ingreso,
            motivo_salida
        } = request.body;

        // Validaciones detalladas
        if (!cliente_id) {
            return reply.status(400).send({
                success: false,
                error: 'Campo obligatorio: cliente_id'
            });
        }

        if (!fecha) {
            return reply.status(400).send({
                success: false,
                error: 'Campo obligatorio: fecha'
            });
        }

        if (!detalles || !Array.isArray(detalles)) {
            return reply.status(400).send({
                success: false,
                error: 'Detalles debe ser un array'
            });
        }

        if (detalles.length === 0) {
            return reply.status(400).send({
                success: false,
                error: 'Debe incluir al menos un detalle de producto'
            });
        }

        try {
            // Verificar cliente
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) {
                return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
            }

            // Validar detalles
            for (const detalle of detalles) {
                if (!detalle.producto_id || !detalle.cantidad || Number(detalle.cantidad) <= 0) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Cada detalle debe incluir producto_id y cantidad > 0'
                    });
                }
            }

            // Validar stock por producto
            const totalPorProducto = new Map();
            for (const detalle of detalles) {
                const pid = Number(detalle.producto_id);
                totalPorProducto.set(pid, (totalPorProducto.get(pid) || 0) + Number(detalle.cantidad));
            }

            for (const [pid, totalCantidad] of totalPorProducto.entries()) {
                const producto = await productoRepo.findOneBy({ id: pid });
                if (!producto) {
                    throw new Error(`Producto ${pid} no encontrado`);
                }
                if (Number(producto.stock_actual) < Number(totalCantidad)) {
                    throw new Error(`Stock insuficiente para ${producto.descripcion}. Disponible: ${producto.stock_actual}`);
                }
            }

            // Validar lotes cuando se envían
            for (const detalle of detalles) {
                if (detalle.lote_id) {
                    const lote = await loteRepo.findOneBy({ id: Number(detalle.lote_id) });
                    if (!lote) {
                        throw new Error(`Lote ${detalle.lote_id} no encontrado`);
                    }
                    if (Number(lote.producto_id) !== Number(detalle.producto_id)) {
                        throw new Error(`El lote ${detalle.lote_id} no corresponde al producto ${detalle.producto_id}`);
                    }
                    if (Number(lote.cantidad_disponible) < Number(detalle.cantidad)) {
                        throw new Error(`Stock insuficiente en lote ${lote.numero_lote}. Disponible: ${lote.cantidad_disponible}`);
                    }
                }
            }

            const numeroSalida = await generarNumeroSalida();

            // Crear nota
            const nota = notaSalidaRepo.create({
                numero_salida: numeroSalida,
                cliente_id: Number(cliente_id),
                fecha,
                responsable_id,
                tipo_documento: tipo_documento || null,
                numero_documento: numero_documento || null,
                fecha_ingreso: fecha_ingreso || null,
                motivo_salida: motivo_salida || null,
                observaciones,
                estado: 'REGISTRADA'
            });

            // Iniciar transacción
            let notaGuardada = null;
            await fastify.db.transaction(async (transactionalEntityManager) => {
                notaGuardada = await transactionalEntityManager.save('NotaSalida', nota);

                for (const detalle of detalles) {
                    const producto = await transactionalEntityManager.findOne('Producto', { where: { id: Number(detalle.producto_id) } });

                    let lote = null;
                    if (detalle.lote_id) {
                        lote = await transactionalEntityManager.findOne('Lote', { where: { id: Number(detalle.lote_id) } });
                        if (!lote) {
                            throw new Error(`Lote ${detalle.lote_id} no encontrado`);
                        }
                        lote.cantidad_disponible = Number(lote.cantidad_disponible) - Number(detalle.cantidad);
                        if (lote.cantidad_disponible < 0) lote.cantidad_disponible = 0;
                        await transactionalEntityManager.save('Lote', lote);
                    }

                    // Crear detalle
                    const detalleNota = notaSalidaDetalleRepo.create({
                        nota_salida_id: notaGuardada.id,
                        producto_id: detalle.producto_id,
                        lote_id: detalle.lote_id || null,
                        cantidad: detalle.cantidad,
                        precio_unitario: detalle.precio_unitario
                    });
                    await transactionalEntityManager.save('NotaSalidaDetalle', detalleNota);

                    // Actualizar stock del producto
                    producto.stock_actual = Number(producto.stock_actual) - Number(detalle.cantidad);
                    await transactionalEntityManager.save('Producto', producto);

                    // Registrar en kardex
                    const movimiento = kardexRepo.create({
                        producto_id: detalle.producto_id,
                        lote_numero: lote ? lote.numero_lote : null,
                        tipo_movimiento: 'SALIDA',
                        cantidad: detalle.cantidad,
                        saldo: producto.stock_actual,
                        documento_tipo: 'NOTA_SALIDA',
                        documento_numero: numeroSalida,
                        referencia_id: notaGuardada.id
                    });
                    await transactionalEntityManager.save('Kardex', movimiento);
                }
            });

            return reply.status(201).send({
                success: true,
                data: notaGuardada,
                message: 'Nota de salida creada exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // PUT /api/salidas/:id - Actualizar nota de salida
    fastify.put('/api/salidas/:id', async (request, reply) => {
        const { id } = request.params;
        const { estado, observaciones } = request.body;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de salida no encontrada' });
        }

        if (estado) nota.estado = estado;
        if (observaciones) nota.observaciones = observaciones;

        await notaSalidaRepo.save(nota);

        return {
            success: true,
            data: nota,
            message: 'Nota actualizada exitosamente'
        };
    });

    // POST /api/salidas/:id/despachar - Despachar nota
    fastify.post('/api/salidas/:id/despachar', async (request, reply) => {
        const { id } = request.params;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota no encontrada' });
        }

        nota.estado = 'DESPACHADA';
        await notaSalidaRepo.save(nota);

        return {
            success: true,
            data: nota,
            message: 'Nota despachada exitosamente'
        };
    });

    // POST /api/salidas/importar - Importar desde Excel
    fastify.post('/api/salidas/importar', async (request, reply) => {
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
                    fecha,
                    codigo_cliente,
                    responsable,
                    codigo_producto,
                    cantidad,
                    precio,
                    observaciones
                ] = row.values.slice(1);

                // Validaciones
                if (!fecha || !codigo_cliente || !codigo_producto || !cantidad) {
                    errores.push(`Fila ${rowNumber}: Faltan datos obligatorios`);
                    return;
                }

                try {
                    // Buscar cliente
                    const cliente = await clienteRepo.findOneBy({ codigo: String(codigo_cliente) });
                    if (!cliente) {
                        errores.push(`Fila ${rowNumber}: Cliente no encontrado`);
                        return;
                    }

                    // Buscar producto
                    const producto = await productoRepo.findOneBy({ codigo: String(codigo_producto) });
                    if (!producto) {
                        errores.push(`Fila ${rowNumber}: Producto no encontrado`);
                        return;
                    }

                    // Validar stock
                    if (Number(producto.stock_actual) < Number(cantidad)) {
                        errores.push(`Fila ${rowNumber}: Stock insuficiente de ${codigo_producto}`);
                        return;
                    }

                    const numeroSalida = await generarNumeroSalida();

                    const nota = notaSalidaRepo.create({
                        numero_salida: numeroSalida,
                        cliente_id: cliente.id,
                        fecha: new Date(fecha),
                        responsable_id: responsable ? Number(responsable) : 1,
                        observaciones,
                        estado: 'REGISTRADA'
                    });

                    const notaGuardada = await notaSalidaRepo.save(nota);

                    // Crear detalle
                    const detalle = notaSalidaDetalleRepo.create({
                        nota_salida_id: notaGuardada.id,
                        producto_id: producto.id,
                        cantidad: Number(cantidad),
                        precio_unitario: precio ? Number(precio) : null
                    });
                    await notaSalidaDetalleRepo.save(detalle);

                    // Descontar stock
                    producto.stock_actual = Number(producto.stock_actual) - Number(cantidad);
                    await productoRepo.save(producto);

                    // Kardex
                    const movimiento = kardexRepo.create({
                        producto_id: producto.id,
                        tipo_movimiento: 'SALIDA',
                        cantidad: Number(cantidad),
                        saldo: producto.stock_actual,
                        documento_tipo: 'NOTA_SALIDA',
                        documento_numero: numeroSalida,
                        referencia_id: notaGuardada.id
                    });
                    await kardexRepo.save(movimiento);

                    generadas++;

                } catch (error) {
                    errores.push(`Fila ${rowNumber}: ${error.message}`);
                }
            });

            return {
                success: true,
                message: `Importación completada: ${generadas} notas generadas`,
                errores: errores.length > 0 ? errores : undefined
            };

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // GET /api/salidas/exportar - Exportar a Excel
    fastify.get('/api/salidas/exportar', async (request, reply) => {
        const notas = await notaSalidaRepo
            .createQueryBuilder('nota')
            .leftJoinAndMapOne('nota.cliente', 'clientes', 'cliente', 'cliente.id = nota.cliente_id')
            .orderBy('nota.created_at', 'DESC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Notas de Salida');

        worksheet.columns = [
            { header: 'Número Salida', key: 'numero_salida', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 30 },
            { header: 'Estado', key: 'estado', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        notas.forEach(nota => {
            worksheet.addRow({
                numero_salida: nota.numero_salida,
                fecha: new Date(nota.fecha).toLocaleDateString('es-AR'),
                cliente: nota.cliente?.razon_social || '- ',
                estado: nota.estado,
                observaciones: nota.observaciones
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=notas-salida.xlsx');
        return reply.send(buffer);
    });

    // GET /api/salidas/plantilla/descargar - Descargar plantilla
    fastify.get('/api/salidas/plantilla/descargar', async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla Salida');

        worksheet.columns = [
            { header: 'Fecha (YYYY-MM-DD)', key: 'fecha', width: 20 },
            { header: 'Código Cliente', key: 'codigo_cliente', width: 20 },
            { header: 'Responsable (ID)', key: 'responsable', width: 15 },
            { header: 'Código Producto', key: 'codigo_producto', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Precio Unitario', key: 'precio', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        worksheet.addRow({
            fecha: '2026-01-30',
            codigo_cliente: 'CLI001',
            responsable: '1',
            codigo_producto: 'PROD001',
            cantidad: '50',
            precio: '10.50',
            observaciones: 'Salida normal'
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla-salida.xlsx');
        return reply.send(buffer);
    });

    // GET /api/salidas/:id/pdf - Exportar PDF
    fastify.get('/api/salidas/:id/pdf', async (request, reply) => {
        const { id } = request.params;
        const nota = await notaSalidaRepo.findOne({
            where: { id: Number(id) }
        });

        if (!nota) return reply.status(404).send({ error: 'Nota no encontrada' });

        const detalles = await notaSalidaDetalleRepo.find({
            where: { nota_salida_id: nota.id },
            relations: ['producto', 'lote']
        });

        const cliente = await clienteRepo.findOneBy({ id: nota.cliente_id });

        // Calcular totales para el footer
        const totalBultos = detalles.reduce((acc, d) => acc + Number(d.cant_bulto || 0), 0);
        const totalCajas = detalles.reduce((acc, d) => acc + Number(d.cant_caja || 0), 0);
        const totalFraccion = detalles.reduce((acc, d) => acc + Number(d.cant_fraccion || 0), 0);
        const totalUnidades = detalles.reduce((acc, d) => acc + Number(d.cant_total || d.cantidad || 0), 0);

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
            pageOrientation: 'landscape',
            pageMargins: [20, 20, 20, 20],
            content: [
                // Encabezado
                {
                    columns: [
                        logoImage,
                        { text: 'NOTA DE SALIDA', style: 'headerTitle', alignment: 'center', margin: [0, 10, 0, 0] },
                        { text: `N° ${Number(nota.numero_salida)}`, style: 'headerNumber', alignment: 'right', margin: [0, 10, 0, 0] }
                    ],
                    margin: [0, 0, 0, 10]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 1 }] },

                // Datos Cliente y Salida
                {
                    columns: [
                        {
                            width: '60%',
                            stack: [
                                {
                                    columns: [
                                        { text: 'Razón Social :', width: 80, style: 'labelBold' },
                                        { text: cliente?.razon_social || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Código Cliente :', width: 80, style: 'labelBold' },
                                        { text: cliente?.codigo || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'RUC :', width: 80, style: 'labelBold' },
                                        { text: cliente?.cuit || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Dirección :', width: 80, style: 'labelBold' },
                                        { text: cliente?.direccion || '-', style: 'labelText' }
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
                                        { text: 'Fecha de Salida:', width: '*', alignment: 'right', style: 'labelBold' },
                                        { text: new Date(nota.fecha).toLocaleDateString('es-PE'), width: 100, alignment: 'right', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Motivo:', width: '*', alignment: 'right', style: 'labelBold' },
                                        { text: nota.motivo_salida || '-', width: 100, alignment: 'right', style: 'labelText' }
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
                                { text: (d.lote ? d.lote.numero_lote : d.lote_numero) || '-', style: 'tableCell' },
                                { text: (d.lote ? new Date(d.lote.fecha_vencimiento).toLocaleDateString('es-PE') : (d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-')), style: 'tableCell' },
                                { text: d.producto?.unidad || 'UND', style: 'tableCell' },
                                { text: d.producto?.fabricante || '-', style: 'tableCell' },
                                { text: (d.producto?.temperatura_min_c != null) ? `${d.producto.temperatura_min_c}° ${d.producto.temperatura_max_c}°C` : '-', style: 'tableCell' },
                                { text: parseFloat(d.cant_bulto || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_caja || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_por_caja || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_fraccion || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_total || d.cantidad).toFixed(2), style: 'tableCell' }
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
                                        { text: nota.motivo_salida || '(Describir causa)' }
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
                        { stack: [{ text: '________________________' }, { text: 'Despachó' }], alignment: 'center' }
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
            reply.header('Content-Disposition', `inline; filename=salida-${nota.numero_salida}.pdf`);
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

module.exports = salidasRoutes;
