const { correctLotData } = require('../services/lotes-datos.service');
const { quantity, lockProducts, stock, audit } = require('../utils/inventory');
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
            // Evitar dependencia de una columna cliente_id ausente en notas_ingreso, uniendo por RUC (cuit <-> cliente_ruc) de forma robusta.
            queryBuilder.leftJoin('clientes', 'cliente', "regexp_replace(coalesce(cliente.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(notaIngreso.cliente_ruc, ''), '\\D', '', 'g')");
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
        try {
            const result = await fastify.db.transaction(async tx => {
                const body = request.body;
                const amount = quantity(body.cantidad_ingresada);
                if (!String(body.numero_lote || '').trim()) throw new Error('El número de lote es obligatorio');
                if (body.nota_ingreso_id) throw new Error('Los lotes vinculados a ingresos deben registrarse desde la nota de ingreso');
                await lockProducts(tx, [body.producto_id]);
                if (!await tx.findOne('Producto', { where: { id: Number(body.producto_id) } })) throw new Error('Producto no encontrado');
                const lote = await tx.save('Lote', loteRepo.create({ producto_id: Number(body.producto_id),
                    numero_lote: String(body.numero_lote).trim(), fecha_vencimiento: body.fecha_vencimiento || null,
                    cantidad_ingresada: amount, cantidad_disponible: amount, nota_ingreso_id: null }));
                await tx.save('Kardex', { producto_id: lote.producto_id, lote_numero: lote.numero_lote,
                    tipo_movimiento: 'AJUSTE_POSITIVO', cantidad: amount, saldo: await stock(tx, lote.producto_id),
                    documento_tipo: 'LOTE_MANUAL', documento_numero: String(lote.id), referencia_id: lote.id });
                await audit(tx, request, 'CREAR', 'lotes', lote.id, null, lote);
                return lote;
            });
            return reply.code(201).send({ success: true, data: result, message: 'Lote creado y registrado en Kardex' });
        } catch (error) { return reply.code(400).send({ success: false, error: error.message }); }
    });

    // Metadata corrections preserve all stock quantities and synchronize document snapshots.
    fastify.patch('/api/lotes/:id/datos', {
        schema: {
            tags: ['Lotes'], description: 'Corregir número de lote y vencimiento sin modificar cantidades',
            params: { type: 'object', required: ['id'], properties: { id: { type: 'integer', minimum: 1 } } },
            body: {
                type: 'object', additionalProperties: false,
                required: ['numero_lote', 'fecha_vencimiento', 'motivo', 'anterior'],
                properties: {
                    numero_lote: { type: 'string', minLength: 1, maxLength: 100 },
                    fecha_vencimiento: { type: ['string', 'null'], format: 'date' },
                    motivo: { type: 'string', minLength: 3, maxLength: 500 },
                    anterior: { type: 'object', additionalProperties: false,
                        required: ['numero_lote', 'fecha_vencimiento'], properties: {
                            numero_lote: { type: 'string' }, fecha_vencimiento: { type: ['string', 'null'], format: 'date' }
                        } }
                }
            },
            response: {
                200: { type: 'object', properties: { success: { type: 'boolean' }, data: LoteSchema, message: { type: 'string' } } },
                400: ErrorResponseSchema, 404: ErrorResponseSchema, 409: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            const data = await correctLotData(fastify.db, request, request.params.id, request.body);
            return { success: true, data, message: 'Lote y documentos corregidos. Cantidades conservadas.' };
        } catch (error) {
            if (!error.statusCode || error.statusCode >= 500) request.log.error(error);
            return reply.code(error.statusCode || 500).send({ success: false,
                error: error.statusCode && error.statusCode < 500 ? error.message : 'No se pudo guardar la corrección. Intente nuevamente.' });
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
        try {
            const result = await fastify.db.transaction(async tx => {
                let lote = await tx.findOne('Lote', { where: { id: Number(request.params.id) } });
                if (!lote) throw Object.assign(new Error('Lote no encontrado'), { statusCode: 404 });
                await lockProducts(tx, [lote.producto_id]);
                lote = await tx.findOne('Lote', { where: { id: Number(request.params.id) } });
                const before = { ...lote };
                const value = request.body.cantidad_disponible === undefined ? Number(lote.cantidad_disponible) : Number(request.body.cantidad_disponible);
                if (!Number.isFinite(value) || value < 0) throw new Error('Cantidad inválida');
                if (value > 0) quantity(value);
                const delta = Math.round((value - Number(lote.cantidad_disponible)) * 100) / 100;
                lote.cantidad_disponible = value;
                if (delta > 0) lote.cantidad_ingresada = Number(lote.cantidad_ingresada) + delta;
                if (request.body.fecha_vencimiento !== undefined) lote.fecha_vencimiento = request.body.fecha_vencimiento || null;
                await tx.save('Lote', lote);
                if (delta) await tx.save('Kardex', { producto_id: lote.producto_id, lote_numero: lote.numero_lote,
                    tipo_movimiento: delta > 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO', cantidad: Math.abs(delta),
                    saldo: await stock(tx, lote.producto_id), documento_tipo: 'LOTE_MANUAL',
                    documento_numero: String(lote.id), referencia_id: lote.id });
                await audit(tx, request, 'ACTUALIZAR', 'lotes', lote.id, before, lote);
                return lote;
            });
            return { success: true, data: result, message: 'Lote actualizado y Kardex sincronizado' };
        } catch (error) { return reply.code(error.statusCode || 400).send({ success: false, error: error.message }); }
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
        try {
            const result = await fastify.db.transaction(async tx => {
                let lote = await tx.findOne('Lote', { where: { id: Number(request.params.id) } });
                if (!lote) throw Object.assign(new Error('Lote no encontrado'), { statusCode: 404 });
                await lockProducts(tx, [lote.producto_id]);
                lote = await tx.findOne('Lote', { where: { id: Number(request.params.id) } });
                const before = { ...lote };
                const value = 0;
                if (!Number.isFinite(value) || value < 0) throw new Error('Cantidad inválida');
                if (value > 0) quantity(value);
                const delta = Math.round((value - Number(lote.cantidad_disponible)) * 100) / 100;
                lote.cantidad_disponible = value;
                if (delta > 0) lote.cantidad_ingresada = Number(lote.cantidad_ingresada) + delta;
                
                await tx.save('Lote', lote);
                if (delta) await tx.save('Kardex', { producto_id: lote.producto_id, lote_numero: lote.numero_lote,
                    tipo_movimiento: delta > 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO', cantidad: Math.abs(delta),
                    saldo: await stock(tx, lote.producto_id), documento_tipo: 'LOTE_MANUAL',
                    documento_numero: String(lote.id), referencia_id: lote.id });
                await audit(tx, request, 'DESACTIVAR', 'lotes', lote.id, before, lote);
                return lote;
            });
            return { success: true, data: result, message: 'Lote desactivado y Kardex sincronizado' };
        } catch (error) { return reply.code(error.statusCode || 400).send({ success: false, error: error.message }); }
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
                .leftJoin('clientes', 'cliente', "regexp_replace(coalesce(cliente.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(notaIngreso.cliente_ruc, ''), '\\D', '', 'g')")
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
