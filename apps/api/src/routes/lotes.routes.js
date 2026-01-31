async function lotesRoutes(fastify, options) {
    const loteRepo = fastify.db.getRepository('Lote');
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/lotes - Listar lotes
    fastify.get('/api/lotes', async (request, reply) => {
        const { 
            producto_id,
            busqueda,
            disponibles_solo,
            fecha_vencimiento_desde,
            fecha_vencimiento_hasta,
            page = 1,
            limit = 50
        } = request.query;

        const skip = (page - 1) * limit;
        const queryBuilder = loteRepo.createQueryBuilder('lote');

        if (producto_id) {
            queryBuilder.where('lote.producto_id = :producto_id', { producto_id: Number(producto_id) });
        }

        if (busqueda) {
            queryBuilder.andWhere('lote.numero_lote LIKE :busqueda', { busqueda: `%${busqueda}%` });
        }

        if (disponibles_solo === 'true') {
            queryBuilder.andWhere('lote.cantidad_disponible > 0');
        }

        if (fecha_vencimiento_desde) {
            queryBuilder.andWhere('lote.fecha_vencimiento >= :fecha_desde', { fecha_desde: fecha_vencimiento_desde });
        }

        if (fecha_vencimiento_hasta) {
            queryBuilder.andWhere('lote.fecha_vencimiento <= :fecha_hasta', { fecha_hasta: fecha_vencimiento_hasta });
        }

        queryBuilder
            .leftJoinAndSelect('lote.producto', 'producto')
            .orderBy('lote.fecha_vencimiento', 'ASC')
            .skip(skip)
            .take(limit);

        const [lotes, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: lotes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/lotes/:id - Obtener lote
    fastify.get('/api/lotes/:id', async (request, reply) => {
        const { id } = request.params;

        const lote = await loteRepo.findOne({
            where: { id: Number(id) },
            relations: ['producto']
        });

        if (!lote) {
            return reply.status(404).send({ success: false, error: 'Lote no encontrado' });
        }

        return {
            success: true,
            data: lote
        };
    });

    // POST /api/lotes - Crear lote
    fastify.post('/api/lotes', async (request, reply) => {
        const {
            producto_id,
            numero_lote,
            fecha_vencimiento,
            cantidad_ingresada,
            nota_ingreso_id
        } = request.body;

        // Validaciones
        if (!producto_id || !numero_lote || !cantidad_ingresada) {
            return reply.status(400).send({
                success: false,
                error: 'Producto ID, número de lote y cantidad son obligatorios'
            });
        }

        try {
            // Verificar producto
            const producto = await productoRepo.findOneBy({ id: Number(producto_id) });
            if (!producto) {
                return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
            }

            const lote = loteRepo.create({
                producto_id: Number(producto_id),
                numero_lote,
                fecha_vencimiento,
                cantidad_ingresada: Number(cantidad_ingresada),
                cantidad_disponible: Number(cantidad_ingresada),
                nota_ingreso_id: nota_ingreso_id ? Number(nota_ingreso_id) : null
            });

            const loteGuardado = await loteRepo.save(lote);

            return reply.status(201).send({
                success: true,
                data: loteGuardado,
                message: 'Lote creado exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // PUT /api/lotes/:id - Actualizar lote
    fastify.put('/api/lotes/:id', async (request, reply) => {
        const { id } = request.params;
        const { fecha_vencimiento, cantidad_disponible } = request.body;

        const lote = await loteRepo.findOneBy({ id: Number(id) });
        if (!lote) {
            return reply.status(404).send({ success: false, error: 'Lote no encontrado' });
        }

        if (fecha_vencimiento) lote.fecha_vencimiento = fecha_vencimiento;
        if (cantidad_disponible !== undefined) lote.cantidad_disponible = Number(cantidad_disponible);

        await loteRepo.save(lote);

        return {
            success: true,
            data: lote,
            message: 'Lote actualizado exitosamente'
        };
    });

    // DELETE /api/lotes/:id - Eliminar lote (lógico)
    fastify.delete('/api/lotes/:id', async (request, reply) => {
        const { id } = request.params;

        const lote = await loteRepo.findOneBy({ id: Number(id) });
        if (!lote) {
            return reply.status(404).send({ success: false, error: 'Lote no encontrado' });
        }

        lote.cantidad_disponible = 0;
        await loteRepo.save(lote);

        return {
            success: true,
            message: 'Lote desactivado exitosamente'
        };
    });

    // GET /api/lotes/producto/:producto_id - Lotes de un producto
    fastify.get('/api/lotes/producto/:producto_id', async (request, reply) => {
        const { producto_id } = request.params;

        const lotes = await loteRepo.find({
            where: { producto_id: Number(producto_id) },
            order: { fecha_vencimiento: 'ASC' }
        });

        return {
            success: true,
            data: lotes
        };
    });
}

module.exports = lotesRoutes;
