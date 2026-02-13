const { getRepository } = require('typeorm');
const { ActaRecepcion, ActaRecepcionDetalle } = require('../entities/ActaRecepcion');
const { Cliente } = require('../entities/Cliente');
const { Producto } = require('../entities/Producto');

module.exports = async function (fastify, opts) {
    // GET /api/actas - Listar todas las actas
    fastify.get('/api/actas', async (request, reply) => {
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
    fastify.get('/api/actas/:id', async (request, reply) => {
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
    fastify.post('/api/actas', async (request, reply) => {
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
    fastify.delete('/api/actas/:id', async (request, reply) => {
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
    fastify.put('/api/actas/:id', async (request, reply) => {
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

    // GET /api/actas/:id/pdf - Generar PDF del acta de recepción
    fastify.get('/api/actas/:id/pdf', async (request, reply) => {
        try {
            const { id } = request.params;
            const { generatePDF } = require('../services/pdf.service');
            const fs = require('fs');
            const path = require('path');

            // Obtener acta con relaciones
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

            // Logo
            const logoPath = path.join(__dirname, '../assets/logo.png');
            let logoImage = null;
            if (fs.existsSync(logoPath)) {
                logoImage = { image: logoPath, width: 150 };
            } else {
                logoImage = { text: 'AGUPAL PERU', style: 'brand', fontSize: 20 };
            }

            // Calcular totales
            const totalSolicitado = acta.detalles.reduce((acc, d) => acc + Number(d.cantidad_solicitada || 0), 0);
            const totalRecibido = acta.detalles.reduce((acc, d) => acc + Number(d.cantidad_recibida || 0), 0);
            const diferencia = totalRecibido - totalSolicitado;

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
                            { text: 'ACTA DE RECEPCIÓN', style: 'headerTitle', alignment: 'center', margin: [0, 10, 0, 0] },
                            { 
                                stack: [
                                    { text: `Nº ${acta.id}`, style: 'headerNumber', alignment: 'right' },
                                    { text: 'AGUPAL', style: 'headerSubtitle', alignment: 'right' }
                                ],
                                margin: [0, 5, 0, 0] 
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 1 }] },

                    // Información del Acta
                    {
                        columns: [
                            {
                                width: '50%',
                                stack: [
                                    {
                                        columns: [
                                            { text: 'Cliente:', width: 100, style: 'labelBold' },
                                            { text: acta.cliente?.nombre || '-', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Proveedor:', width: 100, style: 'labelBold' },
                                            { text: acta.proveedor || '-', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Tipo Documento:', width: 100, style: 'labelBold' },
                                            { text: acta.tipo_documento || '-', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Nº Documento:', width: 100, style: 'labelBold' },
                                            { text: acta.numero_documento || '-', style: 'labelText' }
                                        ]
                                    }
                                ],
                                margin: [0, 10, 0, 0]
                            },
                            {
                                width: '50%',
                                stack: [
                                    {
                                        columns: [
                                            { text: 'Fecha:', width: 120, alignment: 'right', style: 'labelBold' },
                                            { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: 100, alignment: 'right', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Tipo Operación:', width: 120, alignment: 'right', style: 'labelBold' },
                                            { text: acta.tipo_operacion || '-', width: 100, alignment: 'right', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Tipo Conteo:', width: 120, alignment: 'right', style: 'labelBold' },
                                            { text: acta.tipo_conteo || '-', width: 100, alignment: 'right', style: 'labelText' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'Cond. Temperatura:', width: 120, alignment: 'right', style: 'labelBold' },
                                            { text: acta.condicion_temperatura || '-', width: 100, alignment: 'right', style: 'labelText' }
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
                            widths: [20, 50, '*', 50, 45, 30, 60, 45, 45, 45, 45, 40],
                            body: [
                                [
                                    { text: 'Item', style: 'tableHeader' },
                                    { text: 'Código', style: 'tableHeader' },
                                    { text: 'Producto', style: 'tableHeader' },
                                    { text: 'Lote', style: 'tableHeader' },
                                    { text: 'Vencimiento', style: 'tableHeader' },
                                    { text: 'UM', style: 'tableHeader' },
                                    { text: 'Fabricante', style: 'tableHeader' },
                                    { text: 'Temp.', style: 'tableHeader' },
                                    { text: 'Solicitado', style: 'tableHeader' },
                                    { text: 'Recibido', style: 'tableHeader' },
                                    { text: 'Diferencia', style: 'tableHeader' },
                                    { text: 'Aspecto', style: 'tableHeader' }
                                ],
                                ...acta.detalles.map((d, idx) => {
                                    const dif = Number(d.cantidad_recibida || 0) - Number(d.cantidad_solicitada || 0);
                                    return [
                                        { text: String(idx + 1), style: 'tableCell' },
                                        { text: d.producto_codigo || d.producto?.codigo || '-', style: 'tableCell' },
                                        { text: d.producto_nombre || d.producto?.descripcion || '-', style: 'tableCell', alignment: 'left' },
                                        { text: d.lote_numero || '-', style: 'tableCell' },
                                        { text: d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-', style: 'tableCell' },
                                        { text: d.um || '-', style: 'tableCell' },
                                        { text: d.fabricante || '-', style: 'tableCell', alignment: 'left' },
                                        { text: (d.temperatura_min && d.temperatura_max) ? `${d.temperatura_min}°-${d.temperatura_max}°C` : '-', style: 'tableCell' },
                                        { text: parseFloat(d.cantidad_solicitada || 0).toFixed(2), style: 'tableCell' },
                                        { text: parseFloat(d.cantidad_recibida || 0).toFixed(2), style: 'tableCell', bold: true },
                                        { text: dif.toFixed(2), style: 'tableCell', color: dif === 0 ? 'green' : (dif > 0 ? 'blue' : 'red') },
                                        { text: d.aspecto || 'EMB', style: 'tableCell' }
                                    ];
                                })
                            ]
                        },
                        layout: {
                            hLineWidth: function () { return 1; },
                            vLineWidth: function () { return 1; },
                            hLineColor: function () { return 'black'; },
                            vLineColor: function () { return 'black'; },
                            paddingLeft: function () { return 2; },
                            paddingRight: function () { return 2; },
                        }
                    },

                    // Resumen y Observaciones
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    {
                                        text: [
                                            { text: 'Observaciones:\n', bold: true, decoration: 'underline' },
                                            { text: acta.observaciones || 'Sin observaciones' }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 0.5 }] },
                                    {
                                        text: [
                                            { text: 'LEYENDA:\n', bold: true },
                                            { text: 'Aspecto EMB: ', bold: true }, 'Empaque Bueno\n',
                                            { text: 'Aspecto ENB: ', bold: true }, 'Empaque con No conformidades\n',
                                            { text: 'Diferencia: ', bold: true }, 'Cantidad Recibida - Cantidad Solicitada\n'
                                        ],
                                        style: 'legend',
                                        margin: [0, 5, 0, 0]
                                    }
                                ]
                            },
                            {
                                width: 280,
                                table: {
                                    widths: ['50%', '50%'],
                                    body: [
                                        [
                                            { text: 'TOTAL SOLICITADO', style: 'footerGridHeader' },
                                            { text: 'TOTAL RECIBIDO', style: 'footerGridHeader' }
                                        ],
                                        [
                                            { text: parseFloat(totalSolicitado).toFixed(2), style: 'footerGridValue', minHeight: 40 },
                                            { text: parseFloat(totalRecibido).toFixed(2), style: 'footerGridValue', minHeight: 40, bold: true, color: 'blue' }
                                        ],
                                        [
                                            { text: 'DIFERENCIA TOTAL', style: 'footerGridHeader', colSpan: 2 },
                                            {}
                                        ],
                                        [
                                            { 
                                                text: diferencia.toFixed(2), 
                                                style: 'footerGridValue', 
                                                minHeight: 40, 
                                                colSpan: 2,
                                                bold: true,
                                                color: diferencia === 0 ? 'green' : (diferencia > 0 ? 'blue' : 'red')
                                            },
                                            {}
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
                            { 
                                stack: [
                                    { text: '________________________' }, 
                                    { text: 'Recepcionado por', style: 'firma' },
                                    { text: '(Jefe de Almacén)', style: 'firmaDetail' }
                                ], 
                                alignment: 'center' 
                            },
                            { 
                                stack: [
                                    { text: '________________________' }, 
                                    { text: 'Verificado por', style: 'firma' },
                                    { text: '(Control de Calidad)', style: 'firmaDetail' }
                                ], 
                                alignment: 'center' 
                            },
                            { 
                                stack: [
                                    { text: '________________________' }, 
                                    { text: 'Autorizado por', style: 'firma' },
                                    { text: '(Gerencia)', style: 'firmaDetail' }
                                ], 
                                alignment: 'center' 
                            }
                        ],
                        margin: [0, 40, 0, 0]
                    }
                ],
                styles: {
                    brand: { fontSize: 18, bold: true, color: '#0b6aa2' },
                    headerTitle: { fontSize: 16, bold: true },
                    headerNumber: { fontSize: 14, bold: true },
                    headerSubtitle: { fontSize: 10, italics: true },
                    labelBold: { fontSize: 8, bold: true },
                    labelText: { fontSize: 8 },
                    tableHeader: { fontSize: 7, bold: true, color: 'white', fillColor: '#1e40af', alignment: 'center' },
                    tableCell: { fontSize: 7, alignment: 'center' },
                    footerGridHeader: { fontSize: 8, bold: true, fillColor: '#e5e7eb', alignment: 'center' },
                    footerGridValue: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 5, 0, 0] },
                    legend: { fontSize: 6 },
                    firma: { fontSize: 9, bold: true, margin: [0, 5, 0, 0] },
                    firmaDetail: { fontSize: 7, color: 'gray' }
                }
            };

            const buffer = await generatePDF(docDefinition);
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `inline; filename=acta-recepcion-${acta.id}.pdf`);
            return reply.send(buffer);

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error al generar PDF del acta de recepción',
                error: error.message
            });
        }
    });
};
