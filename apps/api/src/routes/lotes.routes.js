// Schemas para documentación Swagger
const LoteSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        numero_lote: { type: 'string' },
        fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
        cantidad_ingresada: { type: 'number' },
        cantidad_disponible: { type: 'number' },
        nota_ingreso_id: { type: 'integer', nullable: true },
        producto: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                codigo: { type: 'string' },
                descripcion: { type: 'string' }
            }
        }
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

async function lotesRoutes(fastify, options) {
    const loteRepo = fastify.db.getRepository('Lote');
    const productoRepo = fastify.db.getRepository('Producto');
    const normalizarRuc = (value) => String(value || '').replace(/\D/g, '').trim();

    // GET /api/lotes - Listar lotes
    fastify.get('/api/lotes', {
        schema: {
            tags: ['Lotes'],
            description: 'Listar lotes con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    producto_id: { type: 'integer', description: 'Filtrar por ID de producto' },
                    busqueda: { type: 'string', description: 'Buscar por número de lote' },
                    disponibles_solo: { type: 'boolean', description: 'Solo lotes con stock disponible' },
                    fecha_vencimiento_desde: { type: 'string', format: 'date' },
                    fecha_vencimiento_hasta: { type: 'string', format: 'date' },
                    cliente_id: { type: 'integer', description: 'Filtrar por cliente de la nota de ingreso' },
                    cliente_ruc: { type: 'string', description: 'Filtrar por RUC/CUIT del cliente de la nota de ingreso' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 50 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: LoteSchema },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            producto_id,
            busqueda,
            disponibles_solo,
            fecha_vencimiento_desde,
            fecha_vencimiento_hasta,
            cliente_id,
            cliente_ruc,
            page = 1,
            limit = 50
        } = request.query;

        const skip = (page - 1) * limit;
        const queryBuilder = loteRepo.createQueryBuilder('lote');

        // Join con NotaIngreso para filtrar por cliente (sin seleccionar columnas)
        queryBuilder.leftJoin('lote.notaIngreso', 'notaIngreso');

        if (producto_id) {
            queryBuilder.andWhere('lote.producto_id = :producto_id', { producto_id: Number(producto_id) });
        }

        if (cliente_id) {
            // Evitar dependencia de una columna cliente_id ausente en notas_ingreso.
            queryBuilder.leftJoin('clientes', 'cliente', 'cliente.razon_social = notaIngreso.proveedor');
            queryBuilder.andWhere('cliente.id = :cliente_id', { cliente_id: Number(cliente_id) });
        }

        if (cliente_ruc) {
            const rucNormalizado = normalizarRuc(cliente_ruc);
            queryBuilder.andWhere("regexp_replace(coalesce(notaIngreso.cliente_ruc, ''), '\\D', '', 'g') = :cliente_ruc", {
                cliente_ruc: rucNormalizado
            });
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
    fastify.get('/api/lotes/:id', {
        schema: {
            tags: ['Lotes'],
            description: 'Obtener detalles de un lote específico',
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
                        data: LoteSchema
                    }
                },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
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
    fastify.post('/api/lotes', {
        schema: {
            tags: ['Lotes'],
            description: 'Crear un nuevo lote de producto',
            body: {
                type: 'object',
                required: ['producto_id', 'numero_lote', 'cantidad_ingresada'],
                properties: {
                    producto_id: { type: 'integer' },
                    numero_lote: { type: 'string' },
                    fecha_vencimiento: { type: 'string', format: 'date' },
                    cantidad_ingresada: { type: 'number', minimum: 0 },
                    nota_ingreso_id: { type: 'integer' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: LoteSchema,
                        message: { type: 'string' }
                    }
                },
                400: ErrorResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
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
    fastify.put('/api/lotes/:id', {
        schema: {
            tags: ['Lotes'],
            description: 'Actualizar información de un lote',
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
                    fecha_vencimiento: { type: 'string', format: 'date' },
                    cantidad_disponible: { type: 'number', minimum: 0 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: LoteSchema,
                        message: { type: 'string' }
                    }
                },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
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
    fastify.delete('/api/lotes/:id', {
        schema: {
            tags: ['Lotes'],
            description: 'Desactivar un lote (borrado lógico)',
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
    fastify.get('/api/lotes/producto/:producto_id', {
        schema: {
            tags: ['Lotes'],
            description: 'Obtener todos los lotes de un producto específico',
            params: {
                type: 'object',
                required: ['producto_id'],
                properties: {
                    producto_id: { type: 'integer' }
                }
            },
            querystring: {
                type: 'object',
                properties: {
                    cliente_id: { type: 'integer', description: 'Filtrar por cliente de la nota de ingreso' },
                    cliente_ruc: { type: 'string', description: 'Filtrar por RUC/CUIT del cliente de la nota de ingreso' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: LoteSchema }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { producto_id } = request.params;
        const { cliente_id, cliente_ruc } = request.query;

        const queryBuilder = loteRepo.createQueryBuilder('lote')
            .where('lote.producto_id = :producto_id', { producto_id: Number(producto_id) })
            .orderBy('lote.fecha_vencimiento', 'ASC');

        if (cliente_id) {
            queryBuilder
                .leftJoin('lote.notaIngreso', 'notaIngreso')
                .leftJoin('clientes', 'cliente', 'cliente.razon_social = notaIngreso.proveedor')
                .andWhere('cliente.id = :cliente_id', { cliente_id: Number(cliente_id) });
        }

        if (cliente_ruc) {
            const rucNormalizado = normalizarRuc(cliente_ruc);
            queryBuilder
                .leftJoin('lote.notaIngreso', 'notaIngreso')
                .andWhere("regexp_replace(coalesce(notaIngreso.cliente_ruc, ''), '\\D', '', 'g') = :cliente_ruc", {
                    cliente_ruc: rucNormalizado
                });
        }

        const lotes = await queryBuilder.getMany();

        return {
            success: true,
            data: lotes
        };
    });
}

module.exports = lotesRoutes;
