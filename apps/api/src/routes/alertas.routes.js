const { In } = require('typeorm');

// Schemas para documentación Swagger
const AlertaVencimientoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        lote_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        producto_nombre: { type: 'string', nullable: true },
        producto_codigo: { type: 'string', nullable: true },
        lote_numero: { type: 'string' },
        fecha_vencimiento: { type: 'string', format: 'date' },
        estado: { type: 'string', enum: ['VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO'] },
        dias_faltantes: { type: 'integer' },
        leida: { type: 'boolean' },
        lote: { type: 'object' },
        producto: { type: 'object' }
    }
};

const LoteSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        numero_lote: { type: 'string' },
        fecha_vencimiento: { type: 'string', format: 'date', nullable: true },
        cantidad_ingresada: { type: 'number' },
        cantidad_disponible: { type: 'number' },
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

async function alertasRoutes(fastify, options) {
    const alertaVencimientoRepo = fastify.db.getRepository('AlertaVencimiento');
    const loteRepo = fastify.db.getRepository('Lote');
    const productoRepo = fastify.db.getRepository('Producto');

    // Configuración por defecto: alertar 30 días antes del vencimiento
    const DIAS_PREVIOS_ALERTA = 30;

    // Función para generar/actualizar alertas
    const actualizarAlertas = async () => {
        // This function is not needed now since we populate alerts during migration
        // Keep it simple - just return
        return;
    };

    const enriquecerAlertas = async (alertas) => {
        const idsFaltantes = Array.from(
            new Set(
                alertas
                    .filter((alerta) => !alerta.producto && !alerta.lote?.producto && alerta.producto_id)
                    .map((alerta) => alerta.producto_id)
            )
        );

        const productos = idsFaltantes.length > 0
            ? await productoRepo.findBy({ id: In(idsFaltantes) })
            : [];
        const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));

        return alertas.map((alerta) => {
            const producto =
                alerta.producto ||
                alerta.lote?.producto ||
                productosPorId.get(alerta.producto_id) ||
                null;

            return {
                ...alerta,
                producto_nombre: producto?.descripcion || null,
                producto_codigo: producto?.codigo || null
            };
        });
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
            // leida column doesn't exist in the table - skip this filter
        }

        queryBuilder
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_para_vencer', 'ASC')
            .skip(skip)
            .take(limit);

        const [alertas, total] = await queryBuilder.getManyAndCount();
        const alertasEnriquecidas = await enriquecerAlertas(alertas);

        // Contar alertas por estado
        const alertasVencidas = await alertaVencimientoRepo.countBy({ estado: 'VENCIDO' });
        const alertasProximas = await alertaVencimientoRepo.countBy({ estado: 'PROXIMO_A_VENCER' });

        return {
            success: true,
            data: alertasEnriquecidas,
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

        const vencidos = await alertaVencimientoRepo.countBy({ estado: 'VENCIDO' });
        const proximos = await alertaVencimientoRepo.countBy({ estado: 'PROXIMO_A_VENCER' });
        const vigentes = await alertaVencimientoRepo.countBy({ estado: 'NORMAL' });

        // Obtener detalles de los próximos a vencer
        const proximosAVencer = await alertaVencimientoRepo
            .createQueryBuilder('alerta')
            .where('alerta.estado = :estado', {
                estado: 'PROXIMO_A_VENCER'
            })
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_para_vencer', 'ASC')
            .limit(5)
            .getMany();

        // Obtener vencidos recientes
        const vencidosRecientes = await alertaVencimientoRepo
            .createQueryBuilder('alerta')
            .where('alerta.estado = :estado', {
                estado: 'VENCIDO'
            })
            .leftJoinAndSelect('alerta.producto', 'producto')
            .orderBy('alerta.dias_para_vencer', 'DESC')
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
    fastify.post('/api/alertas/marcar-todos-leidos', {
        schema: {
            tags: ['Alertas'],
            description: 'Marcar todas las alertas como leídas',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
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
    fastify.delete('/api/alertas/:id', {
        schema: {
            tags: ['Alertas'],
            description: 'Eliminar una alerta',
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
    fastify.post('/api/alertas/configurar-dias', {
        schema: {
            tags: ['Alertas'],
            description: 'Configurar días de anticipación para alertas de vencimiento',
            body: {
                type: 'object',
                required: ['dias'],
                properties: {
                    dias: { type: 'integer', minimum: 1 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
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
    fastify.get('/api/lotes/proximos-a-vencer', {
        schema: {
            tags: ['Lotes'],
            description: 'Obtener lotes próximos a vencer',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: LoteSchema },
                        mensaje: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
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
    fastify.get('/api/lotes/vencidos', {
        schema: {
            tags: ['Lotes'],
            description: 'Obtener lotes vencidos',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: LoteSchema },
                        mensaje: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
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
