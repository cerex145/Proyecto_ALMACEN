const { ActaRecepcion, ActaRecepcionDetalle } = require('../entities/ActaRecepcion');
const { Cliente } = require('../entities/Cliente');
const { Producto } = require('../entities/Producto');

module.exports = async function (fastify, opts) {
    // GET /api/actas - Listar todas las actas
    fastify.get('/api/actas', async (request, reply) => {
        try {
            const { cliente_id, fecha_desde, fecha_hasta, tipo_documento } = request.query;

            const actasRepo = fastify.db.getRepository(ActaRecepcion);
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

            const actasRepo = fastify.db.getRepository(ActaRecepcion);
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
                responsable_recepcion,
                responsable_entrega,
                jefe_almacen,
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

            const actasRepo = fastify.db.getRepository(ActaRecepcion);
            const detallesRepo = fastify.db.getRepository(ActaRecepcionDetalle);

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
                responsable_recepcion,
                responsable_entrega,
                jefe_almacen,
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

            const actasRepo = fastify.db.getRepository(ActaRecepcion);
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

            const actasRepo = fastify.db.getRepository(ActaRecepcion);
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
            const actasRepo = fastify.db.getRepository(ActaRecepcion);
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

            const AUXILIAR_RECEPCION = 'ROGER E. BLANCAS RAMOS';
            const JEFA_ALMACEN = 'JANETH T. NARVAEZ HUAMANI';

            const logoPath = path.join(__dirname, '../assets/logo.png');
            const logoCell = fs.existsSync(logoPath)
                ? {
                    image: logoPath,
                    fit: [110, 38],
                    alignment: 'center',
                    margin: [0, 4, 0, 4],
                    border: [true, true, true, true]
                }
                : {
                    text: 'AGUPAL PERU',
                    style: 'brandLogo',
                    border: [true, true, true, true]
                };

            // Determinar checkboxes según tipo_documento
            const tipoDoc = (acta.tipo_documento || '').toLowerCase();
            const checkPackingList = tipoDoc.includes('packing') || tipoDoc.includes('package');
            const checkInvoice = tipoDoc.includes('invoice');
            const checkGuiaRemision = tipoDoc.includes('guía') || tipoDoc.includes('guia');
            const checkFactura = tipoDoc.includes('factura');

            // Determinar checkboxes según tipo_operacion
            const tipoOp = (acta.tipo_operacion || '').toLowerCase();
            const checkImportacion = tipoOp.includes('importa');
            const checkCompraLocal = tipoOp.includes('compra') || tipoOp.includes('local');
            const checkTraslado = tipoOp.includes('traslado');
            const checkDevolucion = tipoOp.includes('devolu');

            // Determinar checkboxes según tipo_conteo
            const tipoConteo = (acta.tipo_conteo || '').toLowerCase();
            const checkConteo100 = tipoConteo.includes('100');
            const checkConteoMuestreo = tipoConteo.includes('muestreo');
            const checkConteoSinApertura = tipoConteo.includes('sin apertura') || tipoConteo.includes('caja');

            // Definición del documento con formato AGUPAL
            const docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'landscape',
                pageMargins: [15, 15, 15, 15],
                content: [
                    // Número de documento en esquina superior derecha
                    {
                        text: `N° ${acta.id}`,
                        style: 'cornerNumber',
                        alignment: 'right',
                        margin: [0, 0, 0, 5]
                    },

                    // ENCABEZADO PRINCIPAL
                    {
                        table: {
                            widths: [120, '*', 80],
                            body: [
                                [
                                    logoCell,
                                    {
                                        text: 'ACTA DE RECEPCION',
                                        style: 'mainTitle',
                                        border: [true, true, true, true]
                                    },
                                    {
                                        text: 'POE.ALM. 01.01',
                                        style: 'codeHeader',
                                        border: [true, true, true, true]
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 2,
                            vLineWidth: () => 2,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black'
                        },
                        margin: [0, 0, 0, 2]
                    },

                    // TABLA PRINCIPAL CON 3 SECCIONES
                    {
                        table: {
                            widths: [200, 160, 40, 140],
                            body: [
                                // FILA DE ENCABEZADOS
                                [
                                    { text: 'DATOS GENERALES', style: 'sectionHeader', colSpan: 1 },
                                    { text: 'TIPO DOCUMENTARIO', style: 'sectionHeader', colSpan: 1 },
                                    { text: 'TYPE', style: 'sectionHeader', colSpan: 1 },
                                    { text: 'TIPO DE CONTEO Y REVISION', style: 'sectionHeader', colSpan: 1 }
                                ],
                                // FILA 1
                                [
                                    {
                                        columns: [
                                            { text: 'CLIENTE:', width: 60, style: 'labelBoldSmall' },
                                            { text: acta.cliente?.razon_social || acta.cliente?.nombre || 'No encontrado', width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'PACKING LIST', width: 80, style: 'labelSmall' },
                                            { text: checkPackingList ? 'X' : '', width: 15, style: 'checkbox' },
                                            { text: '', width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'IMPORTACION', width: 80, style: 'labelSmall' },
                                            { text: checkImportacion ? 'X' : '', width: 15, style: 'checkbox' }
                                        ],
                                        colSpan: 2,
                                        border: [true, true, true, true]
                                    },
                                    {}
                                ],
                                // FILA 2
                                [
                                    {
                                        columns: [
                                            { text: 'PROVEEDOR:', width: 60, style: 'labelBoldSmall' },
                                            { text: acta.proveedor || 'No encontrado', width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'INVOICE', width: 50, style: 'labelSmall' },
                                            { text: checkInvoice ? 'X' : '', width: 15, style: 'checkbox' },
                                            { text: acta.numero_documento || '', width: '*', style: 'dataTextSmall' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'COMPRA LOCAL', width: 80, style: 'labelSmall' },
                                            { text: checkCompraLocal ? 'X' : '', width: 15, style: 'checkbox' }
                                        ],
                                        colSpan: 2,
                                        border: [true, true, true, true]
                                    },
                                    {}
                                ],
                                // FILA 3
                                [
                                    {
                                        columns: [
                                            { text: 'FECHA:', width: 60, style: 'labelBoldSmall' },
                                            { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'GUIA REMISION', width: 80, style: 'labelSmall' },
                                            { text: checkGuiaRemision ? 'X' : '', width: 15, style: 'checkbox' },
                                            { text: '', width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'TRASLADO', width: 80, style: 'labelSmall' },
                                            { text: checkTraslado ? 'X' : '', width: 15, style: 'checkbox' }
                                        ],
                                        colSpan: 2,
                                        border: [true, true, true, true]
                                    },
                                    {}
                                ],
                                // FILA 4
                                [
                                    { text: '', border: [true, false, true, true] },
                                    {
                                        columns: [
                                            { text: 'FACTURA', width: 50, style: 'labelSmall' },
                                            { text: checkFactura ? 'X' : '', width: 15, style: 'checkbox' },
                                            { text: '', width: '*', style: 'dataText' }
                                        ],
                                        border: [true, true, true, true]
                                    },
                                    {
                                        columns: [
                                            { text: 'DEVOLUCION', width: 80, style: 'labelSmall' },
                                            { text: checkDevolucion ? 'X' : '', width: 15, style: 'checkbox' }
                                        ],
                                        colSpan: 2,
                                        border: [true, true, true, true]
                                    },
                                    {}
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black',
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 2,
                            paddingBottom: () => 2
                        },
                        margin: [0, 0, 0, 2]
                    },

                    // TABLA DE TIPO DE CONTEO (separada)
                    {
                        table: {
                            widths: [100, 15, 15],
                            body: [
                                [
                                    { text: 'CONTEO AL 100%', style: 'labelSmall' },
                                    { text: 'A', style: 'labelBoldSmall', alignment: 'center' },
                                    { text: checkConteo100 ? 'X' : '', style: 'checkbox', alignment: 'center' }
                                ],
                                [
                                    { text: 'CONTEO POR MUESTREO', style: 'labelSmall' },
                                    { text: 'B', style: 'labelBoldSmall', alignment: 'center' },
                                    { text: checkConteoMuestreo ? 'X' : '', style: 'checkbox', alignment: 'center' }
                                ],
                                [
                                    { text: 'CONT. SIM APERT. DE CAJA', style: 'labelSmall' },
                                    { text: 'C', style: 'labelBoldSmall', alignment: 'center' },
                                    { text: checkConteoSinApertura ? 'X' : '', style: 'checkbox', alignment: 'center' }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black',
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 2,
                            paddingBottom: () => 2
                        },
                        absolutePosition: { x: 640, y: 92 },
                        margin: [0, 0, 0, 2]
                    },

                    // TABLA DE PRODUCTOS
                    {
                        table: {
                            headerRows: 1,
                            widths: [15, 45, '*', 50, 40, 35, 35, 35, 30, 30],
                            body: [
                                [
                                    { text: 'N°', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'CODIGO PRODUCTO', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'DESCRIPCIÓN DEL PRODUCTO', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'FABRICANTE', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'LOTE/SERIE', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'F.VCTO.', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'CANT.SOLIC', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'CANT.RECI', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'ASPECTO', style: 'tableHeader', colSpan: 2 },
                                    {}
                                ],
                                [
                                    {},
                                    {},
                                    {},
                                    {},
                                    {},
                                    {},
                                    {},
                                    {},
                                    { text: 'EMB.', style: 'tableHeaderSmall' },
                                    { text: 'ENV.', style: 'tableHeaderSmall' }
                                ],
                                ...acta.detalles.map((d, idx) => [
                                    { text: String(idx + 1), style: 'tableCell' },
                                    { text: d.producto_codigo || d.producto?.codigo || '', style: 'tableCellSmall' },
                                    { text: d.producto_nombre || d.producto?.descripcion || '', style: 'tableCellLeft' },
                                    { text: d.fabricante || '', style: 'tableCellSmall' },
                                    { text: d.lote_numero || '', style: 'tableCellSmall' },
                                    { text: d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '', style: 'tableCellSmall' },
                                    { text: parseFloat(d.cantidad_solicitada || 0).toFixed(0), style: 'tableCell' },
                                    { text: parseFloat(d.cantidad_recibida || 0).toFixed(0), style: 'tableCell' },
                                    { text: d.aspecto === 'EMB' ? 'X' : '', style: 'tableCell' },
                                    { text: d.aspecto === 'ENV' ? 'X' : '', style: 'tableCell' }
                                ])
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black',
                            paddingLeft: () => 2,
                            paddingRight: () => 2,
                            paddingTop: () => 2,
                            paddingBottom: () => 2,
                            fillColor: (rowIndex) => {
                                return rowIndex === 0 || rowIndex === 1 ? '#d3d3d3' : null;
                            }
                        },
                        margin: [0, 0, 0, 2]
                    },

                    // OBSERVACIONES
                    {
                        text: [
                            { text: 'OBSERVACIONES: ', style: 'labelBoldSmall', italics: true },
                            { text: acta.observaciones || '', style: 'dataTextSmall', italics: true }
                        ],
                        margin: [0, 2, 0, 2]
                    },

                    // SECCIÓN DE FIRMAS
                    {
                        table: {
                            widths: ['50%', '50%'],
                            body: [
                                [
                                    { text: 'RECIBIDO Auxiliar de Recepcion', style: 'firmaHeader', fillColor: '#e5e7eb' },
                                    { text: 'Verificado por Jefe de Almacen', style: 'firmaHeader', fillColor: '#e5e7eb' }
                                ],
                                [
                                    {
                                        columns: [
                                            { text: 'NOMBRE:', width: 50, style: 'labelSmall' },
                                            { text: acta.responsable_recepcion || AUXILIAR_RECEPCION, width: '*', style: 'firmaNombre' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'NOMBRE:', width: 50, style: 'labelSmall' },
                                            { text: acta.jefe_almacen || JEFA_ALMACEN, width: '*', style: 'firmaNombre' }
                                        ]
                                    }
                                ],
                                [
                                    { text: '', margin: [0, 15, 0, 15] },
                                    { text: '', margin: [0, 15, 0, 15] }
                                ],
                                [
                                    {
                                        columns: [
                                            { text: 'FECHA:', width: 40, style: 'labelSmall' },
                                            { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: 60, style: 'dataTextSmall' },
                                            { text: 'FIRMA', width: '*', style: 'labelSmall', alignment: 'right' }
                                        ]
                                    },
                                    {
                                        columns: [
                                            { text: 'FECHA:', width: 40, style: 'labelSmall' },
                                            { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: 60, style: 'dataTextSmall' },
                                            { text: 'FIRMA Y SELLO', width: '*', style: 'labelSmall', alignment: 'right' }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black',
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 2,
                            paddingBottom: () => 2
                        },
                        margin: [0, 2, 0, 2]
                    },

                    // LEYENDA
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        stack: [
                                            { text: 'LEYENDA', style: 'legendTitle', decoration: 'underline' },
                                            {
                                                columns: [
                                                    { text: 'EMB: Embalaje', width: 80, style: 'legendText' },
                                                    { text: '√: Conforme', width: 70, style: 'legendText' },
                                                    { text: 'X: No Conforme', width: 80, style: 'legendText' },
                                                    { text: 'NA: No Aplica', width: 70, style: 'legendText' },
                                                    { text: 'DT: Director Técnico', width: 100, style: 'legendText' },
                                                    { text: 'Q.F. A: Farmacéutico Asistente', width: '*', style: 'legendText' }
                                                ],
                                                margin: [0, 2, 0, 2]
                                            },
                                            { text: 'Características de Conformidad:', style: 'legendSubtitle', margin: [0, 2, 0, 1] },
                                            {
                                                text: 'DESCRIPCION: Nombre del producto, Concentración, forma farmacéutica, presentación farmacéutica de acuerdo al documento.',
                                                style: 'legendDetail',
                                                margin: [0, 0, 0, 1]
                                            },
                                            {
                                                text: 'EMBALAJE: Embalaje, Limpio, no arrugado, no roto, no húmedo, no se encuentre abierto, u otro signo que indique deterioro del producto. Corresponde al producto, limpio, no arrugado, no roto, no húmedo, no se encuentre abierto o evidencia que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.',
                                                style: 'legendDetail',
                                                margin: [0, 0, 0, 1]
                                            },
                                            {
                                                text: 'ENVASE: que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.',
                                                style: 'legendDetail'
                                            }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => 'black',
                            vLineColor: () => 'black',
                            paddingLeft: () => 5,
                            paddingRight: () => 5,
                            paddingTop: () => 3,
                            paddingBottom: () => 3
                        },
                        margin: [0, 2, 0, 0]
                    },

                    // CÓDIGO DE FORMULARIO
                    {
                        text: 'FR.ALM.01.01',
                        style: 'formCode',
                        alignment: 'right',
                        margin: [0, 2, 0, 0]
                    }
                ],
                styles: {
                    cornerNumber: { fontSize: 8, bold: true },
                    brandLogo: { fontSize: 14, bold: true, color: '#1e40af', alignment: 'center', margin: [0, 5, 0, 5] },
                    mainTitle: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
                    codeHeader: { fontSize: 8, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
                    sectionHeader: { fontSize: 8, bold: true, fillColor: '#d3d3d3', alignment: 'center', margin: [0, 2, 0, 2] },
                    labelBoldSmall: { fontSize: 7, bold: true },
                    labelSmall: { fontSize: 7, bold: true },
                    dataText: { fontSize: 7 },
                    dataTextSmall: { fontSize: 6 },
                    checkbox: { fontSize: 10, bold: true },
                    tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: '#d3d3d3' },
                    tableHeaderSmall: { fontSize: 6, bold: true, alignment: 'center', fillColor: '#d3d3d3' },
                    tableCell: { fontSize: 7, alignment: 'center' },
                    tableCellSmall: { fontSize: 6, alignment: 'center' },
                    tableCellLeft: { fontSize: 6, alignment: 'left' },
                    firmaHeader: { fontSize: 7, bold: true, margin: [0, 2, 0, 2] },
                    firmaNombre: { fontSize: 7, bold: true, alignment: 'center' },
                    legendTitle: { fontSize: 7, bold: true, margin: [0, 0, 0, 2] },
                    legendText: { fontSize: 7, bold: true },
                    legendSubtitle: { fontSize: 7, bold: true },
                    legendDetail: { fontSize: 6 },
                    formCode: { fontSize: 8, bold: true }
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
