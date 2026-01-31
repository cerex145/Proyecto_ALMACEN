async function ajustesRoutes(fastify, options) {
    const ajusteRepo = fastify.db.getRepository('AjusteStock');
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/ajustes - Listar ajustes con filtros y paginación
    fastify.get('/api/ajustes', async (request, reply) => {
        const { 
            producto_id, 
            tipo, 
            fecha_desde,
            fecha_hasta,
            page = 1, 
            limit = 50,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = ajusteRepo.createQueryBuilder('ajuste')
            .leftJoinAndSelect('ajuste.producto', 'producto');

        if (producto_id) {
            queryBuilder.andWhere('ajuste.producto_id = :producto_id', { producto_id: Number(producto_id) });
        }

        if (tipo) {
            queryBuilder.andWhere('ajuste.tipo = :tipo', { tipo });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('ajuste.created_at >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('ajuste.created_at <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder
            .orderBy(`ajuste.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [ajustes, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: ajustes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/ajustes/:id - Obtener un ajuste
    fastify.get('/api/ajustes/:id', async (request, reply) => {
        const { id } = request.params;
        
        const ajuste = await ajusteRepo.createQueryBuilder('ajuste')
            .leftJoinAndSelect('ajuste.producto', 'producto')
            .where('ajuste.id = :id', { id: Number(id) })
            .getOne();

        if (!ajuste) {
            return reply.status(404).send({ success: false, error: 'Ajuste no encontrado' });
        }

        return { success: true, data: ajuste };
    });

    // POST /api/ajustes - Crear ajuste de stock
    fastify.post('/api/ajustes', async (request, reply) => {
        const { producto_id, tipo, cantidad, motivo, observaciones } = request.body;

        // Validaciones
        if (!producto_id || !tipo || !cantidad || !motivo) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Producto, Tipo, Cantidad y Motivo son obligatorios' 
            });
        }

        if (!['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'].includes(tipo)) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Tipo debe ser AJUSTE_POSITIVO o AJUSTE_NEGATIVO' 
            });
        }

        const cantidadNum = Number(cantidad);
        if (cantidadNum <= 0) {
            return reply.status(400).send({ 
                success: false, 
                error: 'La cantidad debe ser mayor a 0' 
            });
        }

        // Verificar que el producto existe
        const producto = await productoRepo.findOneBy({ id: Number(producto_id) });
        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        // Verificar stock suficiente para ajustes negativos
        if (tipo === 'AJUSTE_NEGATIVO' && producto.stock_actual < cantidadNum) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Stock insuficiente para realizar el ajuste negativo' 
            });
        }

        // Crear el ajuste
        const nuevoAjuste = ajusteRepo.create({
            producto_id: Number(producto_id),
            tipo,
            cantidad: cantidadNum,
            motivo,
            observaciones: observaciones || null
        });

        // Actualizar el stock del producto
        if (tipo === 'AJUSTE_POSITIVO') {
            producto.stock_actual = Number(producto.stock_actual) + cantidadNum;
        } else {
            producto.stock_actual = Number(producto.stock_actual) - cantidadNum;
        }

        // Guardar en transacción
        await fastify.db.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.save(nuevoAjuste);
            await transactionalEntityManager.save(producto);
        });

        const ajusteGuardado = await ajusteRepo.createQueryBuilder('ajuste')
            .leftJoinAndSelect('ajuste.producto', 'producto')
            .where('ajuste.id = :id', { id: nuevoAjuste.id })
            .getOne();

        return reply.status(201).send({ 
            success: true, 
            data: ajusteGuardado,
            message: 'Ajuste de stock registrado exitosamente' 
        });
    });

    // GET /api/ajustes/reportes/por-producto - Reporte de ajustes por producto
    fastify.get('/api/ajustes/reportes/por-producto', async (request, reply) => {
        const { fecha_desde, fecha_hasta } = request.query;

        const queryBuilder = ajusteRepo.createQueryBuilder('ajuste')
            .leftJoinAndSelect('ajuste.producto', 'producto')
            .select([
                'producto.id as producto_id',
                'producto.codigo as producto_codigo',
                'producto.descripcion as producto_descripcion',
                'SUM(CASE WHEN ajuste.tipo = "AJUSTE_POSITIVO" THEN ajuste.cantidad ELSE 0 END) as total_positivos',
                'SUM(CASE WHEN ajuste.tipo = "AJUSTE_NEGATIVO" THEN ajuste.cantidad ELSE 0 END) as total_negativos',
                'COUNT(*) as total_ajustes'
            ]);

        if (fecha_desde) {
            queryBuilder.andWhere('ajuste.created_at >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('ajuste.created_at <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder.groupBy('producto.id');

        const resultados = await queryBuilder.getRawMany();

        return {
            success: true,
            data: resultados
        };
    });

    // GET /api/ajustes/reportes/por-tipo - Reporte de ajustes por tipo
    fastify.get('/api/ajustes/reportes/por-tipo', async (request, reply) => {
        const { fecha_desde, fecha_hasta } = request.query;

        const queryBuilder = ajusteRepo.createQueryBuilder('ajuste')
            .select([
                'ajuste.tipo as tipo',
                'COUNT(*) as total_ajustes',
                'SUM(ajuste.cantidad) as total_cantidad'
            ]);

        if (fecha_desde) {
            queryBuilder.andWhere('ajuste.created_at >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('ajuste.created_at <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder.groupBy('ajuste.tipo');

        const resultados = await queryBuilder.getRawMany();

        return {
            success: true,
            data: resultados
        };
    });
}

module.exports = ajustesRoutes;
