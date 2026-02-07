const ExcelJS = require('exceljs');

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

        if (busqueda) {
            queryBuilder.where('nota.numero_salida LIKE :busqueda', { busqueda: `%${busqueda}%` });
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
            observaciones 
        } = request.body;

        // Validaciones
        if (!cliente_id || !fecha || !detalles || detalles.length === 0) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Cliente, fecha y detalles son obligatorios' 
            });
        }

        try {
            // Verificar cliente
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) {
                return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
            }

            // Validar stock disponible antes de procesar
            for (const detalle of detalles) {
                const producto = await productoRepo.findOneBy({ id: Number(detalle.producto_id) });
                if (!producto) {
                    throw new Error(`Producto ${detalle.producto_id} no encontrado`);
                }

                if (Number(producto.stock_actual) < Number(detalle.cantidad)) {
                    throw new Error(`Stock insuficiente para ${producto.descripcion}. Disponible: ${producto.stock_actual}`);
                }
            }

            const numeroSalida = await generarNumeroSalida();

            // Crear nota
            const nota = notaSalidaRepo.create({
                numero_salida: numeroSalida,
                cliente_id: Number(cliente_id),
                fecha,
                responsable_id,
                observaciones,
                estado: 'REGISTRADA'
            });

            const notaGuardada = await notaSalidaRepo.save(nota);

            // Crear detalles y descontar stock
            for (const detalle of detalles) {
                const producto = await productoRepo.findOneBy({ id: Number(detalle.producto_id) });

                // Crear detalle
                const detalleNota = notaSalidaDetalleRepo.create({
                    nota_salida_id: notaGuardada.id,
                    producto_id: detalle.producto_id,
                    lote_id: detalle.lote_id,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario
                });
                await notaSalidaDetalleRepo.save(detalleNota);

                // Actualizar stock del producto
                producto.stock_actual = Number(producto.stock_actual) - Number(detalle.cantidad);
                await productoRepo.save(producto);

                // Registrar en kardex
                const movimiento = kardexRepo.create({
                    producto_id: detalle.producto_id,
                    lote_numero: detalle.lote_id ? `LOTE-${detalle.lote_id}` : null,
                    tipo_movimiento: 'SALIDA',
                    cantidad_salida: detalle.cantidad,
                    saldo: producto.stock_actual,
                    documento_tipo: 'NOTA_SALIDA',
                    documento_numero: numeroSalida,
                    referencia_id: notaGuardada.id
                });
                await kardexRepo.save(movimiento);

                // Actualizar lote disponible si aplica
                if (detalle.lote_id) {
                    const lote = await loteRepo.findOneBy({ id: Number(detalle.lote_id) });
                    if (lote) {
                        lote.stock_lote = Number(lote.stock_lote) - Number(detalle.cantidad);
                        if (lote.stock_lote < 0) lote.stock_lote = 0;
                        await loteRepo.save(lote);
                    }
                }
            }

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
                        cantidad_salida: Number(cantidad),
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
            .orderBy('nota.created_at', 'DESC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Notas de Salida');

        worksheet.columns = [
            { header: 'Número Salida', key: 'numero_salida', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Cliente ID', key: 'cliente_id', width: 12 },
            { header: 'Estado', key: 'estado', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        notas.forEach(nota => {
            worksheet.addRow({
                numero_salida: nota.numero_salida,
                fecha: new Date(nota.fecha).toLocaleDateString('es-AR'),
                cliente_id: nota.cliente_id,
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
}

module.exports = salidasRoutes;
