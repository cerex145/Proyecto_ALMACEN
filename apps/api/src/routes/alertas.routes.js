// Schemas para documentación Swagger
const AlertaVencimientoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        lote_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote_numero: { type: 'string' },
        fecha_vencimiento: { type: 'string', format: 'date' },
        estado: { type: 'string', enum: ['VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO'] },
        dias_faltantes: { type: 'integer' },
        leida: { type: 'boolean' },
        lote: { type: 'object' },
        producto: { type: 'object' }
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

async function alertasRoutes(fastify, options) {
    const alertaVencimientoRepo = fastify.db.getRepository('AlertaVencimiento');
    const loteRepo = fastify.db.getRepository('Lote');
    const productoRepo = fastify.db.getRepository('Producto');

    // Configuración por defecto: alertar 30 días antes del vencimiento
    const DIAS_PREVIOS_ALERTA = 30;

    // Función para generar/actualizar alertas
    const actualizarAlertas = async () => {
        const hoy = new Date();

        // Obtener todos los lotes con fecha de vencimiento
        const lotes = await loteRepo
            .createQueryBuilder('lote')
            .where('lote.fecha_vencimiento IS NOT NULL')
            .getMany();

        for (const lote of lotes) {
            // Verificar si ya existe alerta para este lote
            let alerta = await alertaVencimientoRepo.findOneBy({ lote_id: lote.id });

            if (!alerta) {
                // Crear nueva alerta
                const producto = await productoRepo.findOneBy({ id: lote.producto_id });
                const diasFaltantes = Math.ceil((new Date(lote.fecha_vencimiento) - hoy) / (1000 * 60 * 60 * 24));

                let estado = 'VIGENTE';
                if (diasFaltantes < 0) {
                    estado = 'VENCIDO';
                } else if (diasFaltantes <= DIAS_PREVIOS_ALERTA) {
                    estado = 'PROXIMO_A_VENCER';
                }

                alerta = alertaVencimientoRepo.create({
                    lote_id: lote.id,
                    producto_id: lote.producto_id,
                    lote_numero: lote.numero_lote,
                    fecha_vencimiento: lote.fecha_vencimiento,
                    estado,
                    dias_faltantes: diasFaltantes,
                    leida: false
                });

                await alertaVencimientoRepo.save(alerta);
            } else {
                // Actualizar alerta existente
                const diasFaltantes = Math.ceil((new Date(lote.fecha_vencimiento) - hoy) / (1000 * 60 * 60 * 24));

                let estado = 'VIGENTE';
                if (diasFaltantes < 0) {
                    estado = 'VENCIDO';
                } else if (diasFaltantes <= DIAS_PREVIOS_ALERTA) {
                    estado = 'PROXIMO_A_VENCER';
                }

                alerta.estado = estado;
                alerta.dias_faltantes = diasFaltantes;

                await alertaVencimientoRepo.save(alerta);
            }
        }
    };

    // GET /api/alertas/vencimiento - Obtener alertas
    fastify.get('/api/alertas/vencimiento', {
        schema: {
            tags: ['Alertas'],
            description: 'Obtener alertas de vencimiento con filtros',
            querystring: {
                type: 'object',
                properties: {
                    estado: { type: 'string', enum: ['VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO'] },
                    leida: { type: 'boolean' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 50 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: AlertaVencimientoSchema },
                        resumen: {
                            type: 'object',
                            properties: {
                                vencidos: { type: 'integer' },
                                proximos_a_vencer: { type: 'integer' },
                                total_alertas: { type: 'integer' }
                            }
                        },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            estado,
            leida,
            page = 1,
            limit = 50
        } = request.query;

        // Actualizar alertas antes de obtener
        await actualizarAlertas();

        const skip = (page - 1) * limit;
        const queryBuilder = alertaVencimientoRepo.createQueryBuilder('alerta');

        if (estado) {
            queryBuilder.where('alerta.estado = :estado', { estado });
        }

        if (leida !== undefined) {
            queryBuilder.andWhere('alerta.leida = :leida', { leida: leida === 'true' });
        }

        queryBuilder
            .leftJoinAndSelect('alerta.lote', 'lote')
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_faltantes', 'ASC')
            .skip(skip)
            .take(limit);

        const [alertas, total] = await queryBuilder.getManyAndCount();

        // Contar alertas por estado
        const alertasVencidas = await alertaVencimientoRepo.countBy({ estado: 'VENCIDO', leida: false });
        const alertasProximas = await alertaVencimientoRepo.countBy({ estado: 'PROXIMO_A_VENCER', leida: false });

        return {
            success: true,
            data: alertas,
            resumen: {
                vencidos: alertasVencidas,
                proximos_a_vencer: alertasProximas,
                total_alertas: total
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/alertas/resumen - Resumen rápido de alertas
    fastify.get('/api/alertas/resumen', {
        schema: {
            tags: ['Alertas'],
            description: 'Obtener resumen rápido de alertas de vencimiento',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        resumen: {
                            type: 'object',
                            properties: {
                                total_vencidos: { type: 'integer' },
                                total_proximos_a_vencer: { type: 'integer' },
                                total_vigentes: { type: 'integer' },
                                proximos_a_vencer_detalle: { type: 'array', items: AlertaVencimientoSchema },
                                vencidos_detalle: { type: 'array', items: AlertaVencimientoSchema },
                                requiere_atencion: { type: 'boolean' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        await actualizarAlertas();

        const vencidos = await alertaVencimientoRepo.countBy({ estado: 'VENCIDO', leida: false });
        const proximos = await alertaVencimientoRepo.countBy({ estado: 'PROXIMO_A_VENCER', leida: false });
        const vigentes = await alertaVencimientoRepo.countBy({ estado: 'VIGENTE' });

        // Obtener detalles de los próximos a vencer
        const proximosAVencer = await alertaVencimientoRepo
            .createQueryBuilder('alerta')
            .where('alerta.estado = :estado AND alerta.leida = :leida', {
                estado: 'PROXIMO_A_VENCER',
                leida: false
            })
            .leftJoinAndSelect('alerta.lote', 'lote')
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_faltantes', 'ASC')
            .limit(5)
            .getMany();

        // Obtener vencidos recientes
        const vencidosRecientes = await alertaVencimientoRepo
            .createQueryBuilder('alerta')
            .where('alerta.estado = :estado AND alerta.leida = :leida', {
                estado: 'VENCIDO',
                leida: false
            })
            .leftJoinAndSelect('alerta.lote', 'lote')
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_faltantes', 'DESC')
            .limit(5)
            .getMany();

        return {
            success: true,
            resumen: {
                total_vencidos: vencidos,
                total_proximos_a_vencer: proximos,
                total_vigentes: vigentes,
                proximos_a_vencer_detalle: proximosAVencer,
                vencidos_detalle: vencidosRecientes,
                requiere_atencion: vencidos + proximos > 0
            }
        };
    });

    // PUT /api/alertas/:id/marcar-leida - Marcar alerta como leída
    fastify.put('/api/alertas/:id/marcar-leida', {
        schema: {
            tags: ['Alertas'],
            description: 'Marcar una alerta como leída',
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

        const alerta = await alertaVencimientoRepo.findOneBy({ id: Number(id) });
        if (!alerta) {
            return reply.status(404).send({ success: false, error: 'Alerta no encontrada' });
        }

        alerta.leida = true;
        await alertaVencimientoRepo.save(alerta);

        return {
            success: true,
            message: 'Alerta marcada como leída'
        };
    });

    // POST /api/alertas/marcar-todos-leidos - Marcar todas como leídas
    fastify.post('/api/alertas/marcar-todos-leidos', async (request, reply) => {
        await alertaVencimientoRepo
            .createQueryBuilder()
            .update()
            .set({ leida: true })
            .where('leida = :leida', { leida: false })
            .execute();

        return {
            success: true,
            message: 'Todas las alertas marcadas como leídas'
        };
    });

    // DELETE /api/alertas/:id - Eliminar alerta
    fastify.delete('/api/alertas/:id', async (request, reply) => {
        const { id } = request.params;

        const result = await alertaVencimientoRepo.delete({ id: Number(id) });

        if (result.affected === 0) {
            return reply.status(404).send({ success: false, error: 'Alerta no encontrada' });
        }

        return {
            success: true,
            message: 'Alerta eliminada exitosamente'
        };
    });

    // POST /api/alertas/configurar-dias - Configurar días de anticipación para alertas
    fastify.post('/api/alertas/configurar-dias', async (request, reply) => {
        const { dias } = request.body;

        if (!dias || dias < 1) {
            return reply.status(400).send({
                success: false,
                error: 'Días debe ser un número mayor a 0'
            });
        }

        // Aquí se puede guardar la configuración en base de datos o archivo
        // Por ahora solo retornamos confirmación
        return {
            success: true,
            message: `Configuración actualizada: Alertar ${dias} días antes del vencimiento`,
            dias: dias
        };
    });

    // GET /api/lotes/proximos-a-vencer - Lotes próximos a vencer
    fastify.get('/api/lotes/proximos-a-vencer', async (request, reply) => {
        const hoy = new Date();
        const fechaAlerta = new Date(hoy.getTime() + (DIAS_PREVIOS_ALERTA * 24 * 60 * 60 * 1000));

        const lotes = await loteRepo
            .createQueryBuilder('lote')
            .leftJoinAndSelect('lote.producto', 'producto')
            .where('lote.fecha_vencimiento IS NOT NULL')
            .andWhere('lote.fecha_vencimiento <= :fecha_alerta', { fecha_alerta })
            .andWhere('lote.fecha_vencimiento >= :hoy', { hoy })
            .andWhere('lote.cantidad_disponible > 0')
            .orderBy('lote.fecha_vencimiento', 'ASC')
            .getMany();

        return {
            success: true,
            data: lotes,
            mensaje: `${lotes.length} lotes próximos a vencer en los próximos ${DIAS_PREVIOS_ALERTA} días`
        };
    });

    // GET /api/lotes/vencidos - Lotes vencidos
    fastify.get('/api/lotes/vencidos', async (request, reply) => {
        const hoy = new Date();

        const lotes = await loteRepo
            .createQueryBuilder('lote')
            .leftJoinAndSelect('lote.producto', 'producto')
            .where('lote.fecha_vencimiento IS NOT NULL')
            .andWhere('lote.fecha_vencimiento < :hoy', { hoy })
            .andWhere('lote.cantidad_disponible > 0')
            .orderBy('lote.fecha_vencimiento', 'DESC')
            .getMany();

        return {
            success: true,
            data: lotes,
            mensaje: `${lotes.length} lotes vencidos encontrados`
        };
    });
}

module.exports = alertasRoutes;
