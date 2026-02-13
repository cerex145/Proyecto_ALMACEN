const { getRepository } = require('typeorm');
const { ActaRecepcion, ActaRecepcionDetalle } = require('../entities/ActaRecepcion');
const { Cliente } = require('../entities/Cliente');
const { Producto } = require('../entities/Producto');

module.exports = async function (fastify, opts) {
    // GET /api/actas - Listar todas las actas
    fastify.get('/actas', async (request, reply) => {
        try {
            const { cliente_id, fecha_desde, fecha_hasta, tipo_documento } = request.query;
            
            const actasRepo = getRepository(ActaRecepcion);
            let query = actasRepo.createQueryBuilder('acta')
                .leftJoinAndSelect('acta.cliente', 'cliente')
                .leftJoinAndSelect('acta.detalles', 'detalles')
                .leftJoinAndSelect('detalles.producto', 'producto')
                .orderBy('acta.fecha', 'DESC')
                .addOrderBy('acta.id', 'DESC');

            if (cliente_id) {
                query = query.andWhere('acta.cliente_id = :cliente_id', { cliente_id });
            }

            if (fecha_desde) {
                query = query.andWhere('acta.fecha >= :fecha_desde', { fecha_desde });
            }

            if (fecha_hasta) {
                query = query.andWhere('acta.fecha <= :fecha_hasta', { fecha_hasta });
            }

            if (tipo_documento) {
                query = query.andWhere('acta.tipo_documento = :tipo_documento', { tipo_documento });
            }

            const actas = await query.getMany();

            return {
                success: true,
                data: actas,
                total: actas.length
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al obtener actas de recepción',
                error: error.message
            });
        }
    });

    // GET /api/actas/:id - Obtener una acta específica
    fastify.get('/actas/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const actasRepo = getRepository(ActaRecepcion);
            const acta = await actasRepo.createQueryBuilder('acta')
                .leftJoinAndSelect('acta.cliente', 'cliente')
                .leftJoinAndSelect('acta.detalles', 'detalles')
                .leftJoinAndSelect('detalles.producto', 'producto')
                .where('acta.id = :id', { id })
                .getOne();

            if (!acta) {
                return reply.status(404).send({
                    success: false,
                    message: 'Acta de recepción no encontrada'
                });
            }

            return {
                success: true,
                data: acta
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al obtener acta de recepción',
                error: error.message
            });
        }
    });

    // POST /api/actas - Crear nueva acta de recepción
    fastify.post('/actas', async (request, reply) => {
        try {
            const { 
                fecha, 
                tipo_documento, 
                numero_documento, 
                cliente_id, 
                proveedor,
                tipo_operacion,
                tipo_conteo,
                condicion_temperatura,
                observaciones, 
                detalles 
            } = request.body;

            // Validaciones
            if (!cliente_id) {
                return reply.status(400).send({
                    success: false,
                    message: 'El cliente es requerido'
                });
            }

            if (!detalles || detalles.length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Debe incluir al menos un producto'
                });
            }

            const actasRepo = getRepository(ActaRecepcion);
            const detallesRepo = getRepository(ActaRecepcionDetalle);

            // Crear acta principal
            const nuevaActa = actasRepo.create({
                fecha: fecha || new Date(),
                tipo_documento,
                numero_documento,
                cliente_id,
                proveedor,
                tipo_operacion,
                tipo_conteo,
                condicion_temperatura,
                observaciones,
                estado: 'activa'
            });

            const actaGuardada = await actasRepo.save(nuevaActa);

            // Crear detalles
            const detallesCreados = [];
            for (const detalle of detalles) {
                const nuevoDetalle = detallesRepo.create({
                    acta_id: actaGuardada.id,
                    producto_id: detalle.producto_id,
                    producto_codigo: detalle.producto_codigo,
                    producto_nombre: detalle.producto_nombre,
                    fabricante: detalle.fabricante,
                    lote_numero: detalle.lote_numero,
                    fecha_vencimiento: detalle.fecha_vencimiento,
                    um: detalle.um,
                    temperatura_min: detalle.temperatura_min,
                    temperatura_max: detalle.temperatura_max,
                    cantidad_solicitada: detalle.cantidad_solicitada,
                    cantidad_recibida: detalle.cantidad_recibida,
                    cantidad_bultos: detalle.cantidad_bultos || 0,
                    cantidad_cajas: detalle.cantidad_cajas || 0,
                    cantidad_por_caja: detalle.cantidad_por_caja || 0,
                    cantidad_fraccion: detalle.cantidad_fraccion || 0,
                    aspecto: detalle.aspecto || 'EMB',
                    observaciones: detalle.observaciones
                });

                const detalleGuardado = await detallesRepo.save(nuevoDetalle);
                detallesCreados.push(detalleGuardado);
            }

            // Cargar acta completa con relaciones
            const actaCompleta = await actasRepo.createQueryBuilder('acta')
                .leftJoinAndSelect('acta.cliente', 'cliente')
                .leftJoinAndSelect('acta.detalles', 'detalles')
                .where('acta.id = :id', { id: actaGuardada.id })
                .getOne();

            return reply.status(201).send({
                success: true,
                message: 'Acta de recepción creada exitosamente',
                data: actaCompleta
            });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al crear acta de recepción',
                error: error.message
            });
        }
    });

    // DELETE /api/actas/:id - Eliminar acta
    fastify.delete('/actas/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            const actasRepo = getRepository(ActaRecepcion);
            const acta = await actasRepo.findOne({ where: { id } });

            if (!acta) {
                return reply.status(404).send({
                    success: false,
                    message: 'Acta de recepción no encontrada'
                });
            }

            await actasRepo.remove(acta);

            return {
                success: true,
                message: 'Acta de recepción eliminada exitosamente'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al eliminar acta de recepción',
                error: error.message
            });
        }
    });

    // PUT /api/actas/:id - Actualizar estado del acta
    fastify.put('/actas/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { estado, observaciones } = request.body;
            
            const actasRepo = getRepository(ActaRecepcion);
            const acta = await actasRepo.findOne({ where: { id } });

            if (!acta) {
                return reply.status(404).send({
                    success: false,
                    message: 'Acta de recepción no encontrada'
                });
            }

            if (estado) acta.estado = estado;
            if (observaciones !== undefined) acta.observaciones = observaciones;

            await actasRepo.save(acta);

            const actaActualizada = await actasRepo.createQueryBuilder('acta')
                .leftJoinAndSelect('acta.cliente', 'cliente')
                .leftJoinAndSelect('acta.detalles', 'detalles')
                .where('acta.id = :id', { id })
                .getOne();

            return {
                success: true,
                message: 'Acta de recepción actualizada exitosamente',
                data: actaActualizada
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al actualizar acta de recepción',
                error: error.message
            });
        }
    });
};
