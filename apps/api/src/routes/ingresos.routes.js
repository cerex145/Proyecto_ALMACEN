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

            // Crear nota
            const nota = notaIngresoRepo.create({
                numero_ingreso: numeroIngreso,
                fecha,
                proveedor,
                responsable_id,
                observaciones,
                estado: 'REGISTRADA'
            });

            const notaGuardada = await notaIngresoRepo.save(nota);

            // Crear detalles y lotes
            for (const detalle of detalles) {
                // Verificar producto
                const producto = await productoRepo.findOneBy({ id: Number(detalle.producto_id) });
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
                await notaIngresoDetalleRepo.save(detalleNota);

                // Crear lote
                const lote = loteRepo.create({
                    producto_id: detalle.producto_id,
                    numero_lote: detalle.lote_numero,
                    fecha_vencimiento: detalle.fecha_vencimiento,
                    stock_lote: detalle.cantidad,
                    nota_ingreso_id: notaGuardada.id
                });
                await loteRepo.save(lote);

                // Actualizar stock del producto
                producto.stock_actual = Number(producto.stock_actual) + Number(detalle.cantidad);
                await productoRepo.save(producto);

                // Registrar en kardex
                const saldoActual = producto.stock_actual;
                const movimiento = kardexRepo.create({
                    producto_id: detalle.producto_id,
                    lote_numero: detalle.lote_numero,
                    tipo_movimiento: 'INGRESO',
                    cantidad_entrada: detalle.cantidad,
                    saldo: saldoActual,
                    documento_tipo: 'NOTA_INGRESO',
                    documento_numero: numeroIngreso,
                    referencia_id: notaGuardada.id
                });
                await kardexRepo.save(movimiento);
            }

            return reply.status(201).send({
                success: true,
                data: notaGuardada,
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
        const { fecha, proveedor, estado, observaciones } = request.body;

        const nota = await notaIngresoRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de ingreso no encontrada' });
        }

        if (fecha) nota.fecha = fecha;
        if (proveedor) nota.proveedor = proveedor;
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
                    stock_lote: detalle.cantidad,
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
                    cantidad_entrada: detalle.cantidad,
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
}

module.exports = ingresosRoutes;
