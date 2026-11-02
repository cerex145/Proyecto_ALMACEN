const { formatCalendarDate } = require('../utils/calendar');
const { quantity, lockProducts, lockDocumentNumbers, stock, audit } = require('../utils/inventory');
const { applyDetails, restoreDetails } = require('../services/salidas-stock.service');
const { parseNumber, parseCSV } = require('../utils/import');
const ExcelJS = require('exceljs');
const { MoreThan, In } = require('typeorm');
const { generatePDF } = require('../services/pdf.service');

// Schemas para documentación Swagger
const NotaSalidaSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        numero_salida: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        cliente_id: { type: 'integer', nullable: true },
        cliente_ruc: { type: 'string', nullable: true },
        tipo_documento: { type: 'string', nullable: true },
        numero_documento: { type: 'string', nullable: true },
        fecha_ingreso: { type: 'string', format: 'date', nullable: true },
        motivo_salida: { type: 'string', nullable: true },
        estado: { type: 'string' },
        observaciones: { type: 'string', nullable: true }
    }
};

const NotaSalidaDetalleSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        nota_salida_id: { type: 'integer' },
        producto_id: { type: 'integer' },
        cantidad: { type: 'number' },
        cant_bulto: { type: 'number', nullable: true },
        cant_caja: { type: 'number', nullable: true },
        cant_x_caja: { type: 'number', nullable: true },
        cant_fraccion: { type: 'number', nullable: true },
        lote_id: { type: 'integer', nullable: true },
        producto: { type: 'object', nullable: true, additionalProperties: true },
        lote: { type: 'object', nullable: true, additionalProperties: true }
    }
};

const NotaSalidaResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: {
            type: 'object',
            properties: {
                ...NotaSalidaSchema.properties,
                detalles: { type: 'array', items: NotaSalidaDetalleSchema },
                cliente: { type: 'object', nullable: true, additionalProperties: true }
            }
        }
    }
};

const NotaSalidaResponseWithMessageSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: NotaSalidaSchema,
        message: { type: 'string' }
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

        const ultimoNumero = ultimaSalida?.numero_salida ? String(ultimaSalida.numero_salida) : '';
        const matchUltimosDigitos = ultimoNumero.match(/(\d+)(?!.*\d)/);
        const correlativo = matchUltimosDigitos ? Number.parseInt(matchUltimosDigitos[1], 10) : 0;
        const numero = Number.isFinite(correlativo) ? correlativo + 1 : 1;
        return String(numero).padStart(8, '0');
    };

    const normalizarEncabezado = (valor = '') => String(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const mapearEncabezados = (headers = []) => {
        const mapa = new Map();
        headers.forEach((header, index) => {
            const key = normalizarEncabezado(header);
            if (key) mapa.set(key, index);
        });
        return mapa;
    };

    const obtenerValor = (valores, headerMap, aliases = [], fallbackIndex = null) => {
        for (const alias of aliases) {
            const idx = headerMap.get(normalizarEncabezado(alias));
            if (idx !== undefined && idx < valores.length) {
                const valor = String(valores[idx] ?? '').trim();
                if (valor !== '') return valor;
            }
        }

        if (fallbackIndex !== null && fallbackIndex < valores.length) {
            return String(valores[fallbackIndex] ?? '').trim();
        }

        return '';
    };

    const parsearNumero = parseNumber;

    const parsearFecha = (valor, mesAux = '', diaAux = '') => {
        if (valor instanceof Date) return valor;
        const texto = String(valor || '').trim();
        if (!texto) return null;

        if (/^\d{4}$/.test(texto) && mesAux && diaAux) {
            const anio = Number(texto);
            // año epoch cero de Excel (1900/1899) → inválido
            if (anio < 2000 || anio > 2099) return null;
            const mes = String(mesAux).padStart(2, '0');
            const dia = String(diaAux).padStart(2, '0');
            return new Date(`${anio}-${mes}-${dia}`);
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
            const fechaIso = new Date(`${texto}T00:00:00`);
            return Number.isNaN(fechaIso.getTime()) ? null : fechaIso;
        }

        const partes = texto.split('/').map(p => p.trim());
        if (partes.length === 3) {
            const p1 = Number(partes[0]);
            const p2 = Number(partes[1]);
            const p3 = Number(partes[2]);
            if (!Number.isNaN(p1) && !Number.isNaN(p2) && !Number.isNaN(p3)) {
                const anio = p3;
                // año epoch cero de Excel (1900/1899) → inválido
                if (anio < 2000 || anio > 2099) return null;

                const mesAuxNum = Number(mesAux);
                const diaAuxNum = Number(diaAux);
                if (!Number.isNaN(mesAuxNum) && !Number.isNaN(diaAuxNum) && mesAuxNum >= 1 && mesAuxNum <= 12 && diaAuxNum >= 1 && diaAuxNum <= 31) {
                    const isoAux = `${anio}-${String(mesAuxNum).padStart(2, '0')}-${String(diaAuxNum).padStart(2, '0')}`;
                    const fechaAux = new Date(`${isoAux}T00:00:00`);
                    if (!Number.isNaN(fechaAux.getTime())) return fechaAux;
                }

                let dia = p1;
                let mes = p2;
                if (p2 > 12 && p1 <= 12) {
                    mes = p1;
                    dia = p2;
                }

                const iso = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                const fecha = new Date(`${iso}T00:00:00`);
                return Number.isNaN(fecha.getTime()) ? null : fecha;
            }
        }

        const fecha = new Date(texto);
        if (Number.isNaN(fecha.getTime())) return null;
        // año epoch cero de Excel (ej. new Date("1900") → válido pero incorrecto)
        if (fecha.getFullYear() < 2000 || fecha.getFullYear() > 2099) return null;
        return fecha;
    };

    const detectarDelimitador = (linea = '') => {
        if (linea.includes('\t')) return '\t';
        if (linea.includes(';')) return ';';
        return ',';
    };

    const toSqlDate = (dateValue) => {
        if (!dateValue) return null;
        const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
        if (Number.isNaN(dateObj.getTime())) return null;
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const extraerStringCeldaExcel = (valor) => {
        if (valor === null || valor === undefined) return '';
        if (valor instanceof Date) {
            const yyyy = valor.getFullYear();
            const mm = String(valor.getMonth() + 1).padStart(2, '0');
            const dd = String(valor.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
        if (typeof valor === 'object') {
            if (valor.text) return String(valor.text).trim();
            if (valor.richText && Array.isArray(valor.richText)) {
                return valor.richText.map(rt => rt.text || '').join('').trim();
            }
            if (valor.result !== undefined) return String(valor.result).trim();
            if (valor.hyperlink) return String(valor.hyperlink).trim();
        }
        return String(valor).trim();
    };

    // GET /api/salidas - Listar notas de salida
    fastify.get('/api/salidas', {
        schema: {
            tags: ['Salidas'],
            description: 'Listar notas de salida con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    busqueda: { type: 'string' },
                    numero_salida: { type: 'string' },
                    numero_documento: { type: 'string' },
                    fecha_desde: { type: 'string', format: 'date' },
                    fecha_hasta: { type: 'string', format: 'date' },
                    cliente_id: { type: 'integer' },
                    cliente_ruc: { type: 'string' },
                    estado: { type: 'string' },
                    include_detalles: { type: 'boolean', default: false },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 50 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                additionalProperties: true,
                                properties: {
                                    ...NotaSalidaSchema.properties,
                                    detalles: { type: 'array', items: NotaSalidaDetalleSchema },
                                    cliente: { type: 'object', nullable: true, additionalProperties: true }
                                }
                            }
                        },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const {
            busqueda = '',
            numero_salida,
            numero_documento,
            cliente_id,
            cliente_ruc,
            estado,
            fecha_desde,
            fecha_hasta,
            include_detalles = false,
            page = 1,
            limit = 50,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = notaSalidaRepo
            .createQueryBuilder('nota')
            .leftJoin('nota.cliente', 'cliente')
            .leftJoin('nota.detalles', 'search_detalles_filter')
            .distinct(true);

        const terminoBusqueda = busqueda || numero_salida || '';
        if (terminoBusqueda) {
            queryBuilder.where(
                `(
                    nota.numero_salida ILIKE :busqueda
                    OR coalesce(nota.numero_documento, '') ILIKE :busqueda
                    OR coalesce(nota.cliente_ruc, '') ILIKE :busqueda
                    OR coalesce(cliente.razon_social, '') ILIKE :busqueda
                    OR coalesce(cliente.codigo, '') ILIKE :busqueda
                    OR coalesce(search_detalles_filter.lote_numero, '') ILIKE :busqueda
                )`,
                { busqueda: `%${terminoBusqueda}%` }
            );
        }

        if (estado) {
            queryBuilder.andWhere('nota.estado = :estado', { estado });
        }

        if (cliente_id) {
            queryBuilder.andWhere('nota.cliente_id = :cliente_id', { cliente_id: Number(cliente_id) });
        }

        if (cliente_ruc) {
            queryBuilder.andWhere("regexp_replace(coalesce(nota.cliente_ruc, ''), '\\D', '', 'g') = regexp_replace(:cliente_ruc, '\\D', '', 'g')", {
                cliente_ruc: String(cliente_ruc)
            });
        }

        if (numero_documento) {
            queryBuilder.andWhere("coalesce(nota.numero_documento, '') ILIKE :numero_documento", {
                numero_documento: `%${String(numero_documento).trim()}%`
            });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('nota.fecha >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('nota.fecha <= :fecha_hasta', { fecha_hasta });
        }

        const allowedOrderFields = new Set(['created_at', 'fecha', 'estado', 'numero_salida', 'id']);
        const safeOrderBy = allowedOrderFields.has(orderBy) ? orderBy : 'created_at';
        const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        queryBuilder.orderBy(`nota.${safeOrderBy}`, safeOrder);
        queryBuilder.skip(skip).take(limit);

        const [notas, total] = await queryBuilder.getManyAndCount();

        let data = notas;
        if (include_detalles && notas.length > 0) {
            const notaIds = notas.map(n => Number(n.id)).filter(Number.isFinite);
            const detalles = await notaSalidaDetalleRepo
                .createQueryBuilder('detalle')
                .leftJoinAndSelect('detalle.producto', 'producto')
                .where('detalle.nota_salida_id IN (:...notaIds)', { notaIds })
                .orderBy('detalle.id', 'ASC')
                .getMany();

            const detallesPorNota = new Map();
            for (const detalle of detalles) {
                const key = Number(detalle.nota_salida_id);
                if (!detallesPorNota.has(key)) detallesPorNota.set(key, []);
                detallesPorNota.get(key).push(detalle);
            }

            data = notas.map(nota => ({
                ...nota,
                detalles: detallesPorNota.get(Number(nota.id)) || []
            }));
        }

        return {
            success: true,
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/salidas/:id - Obtener nota con detalles
    fastify.get('/api/salidas/historial', {
        schema: {
            tags: ['Salidas'],
            description: 'Historial de salidas optimizado (filas de detalle) con búsqueda por salida, documento, producto, lote y cliente',
            querystring: {
                type: 'object',
                properties: {
                    q: { type: 'string' },
                    limit: { type: 'integer', minimum: 1, default: 2000 }
                }
            }
        }
    }, async (request, reply) => {
        const { q = '', limit = 2000 } = request.query;
        const termino = String(q || '').trim();
        const like = `%${termino}%`;

        const sql = `
            SELECT
                nota.id AS nota_id,
                nota.numero_salida,
                nota.fecha,
                nota.estado,
                COALESCE(NULLIF(nota.cliente_ruc, ''), NULLIF(cliente.cuit, ''), '-') AS cliente_ruc,
                detalle.id AS detalle_id,
                detalle.producto_id,
                                COALESCE(NULLIF(detalle.lote_numero, ''), NULLIF(detalle.lote_numero, '-'), kardex_fallback.lote_numero) AS lote_numero,
                                COALESCE(detalle.fecha_vencimiento, lote_fallback.fecha_vencimiento) AS fecha_vencimiento,
                                COALESCE(NULLIF(NULLIF(detalle.um, ''), '-'), NULLIF(prod.unidad_medida, ''), um_fallback.um) AS um,
                detalle.cantidad,
                                COALESCE(detalle.cantidad_total, detalle.cantidad) AS cantidad_total,
                                CASE
                                    WHEN COALESCE(detalle.cant_bulto, 0) = 0
                                     AND COALESCE(detalle.cant_caja, 0) = 0
                                     AND COALESCE(detalle.cant_x_caja, 0) = 0
                                     AND COALESCE(detalle.cant_fraccion, 0) = 0
                                     AND COALESCE(detalle.cantidad_total, detalle.cantidad, 0) > 0
                                    THEN 1
                                    ELSE COALESCE(detalle.cant_bulto, 0)
                                END AS cant_bulto,
                                CASE
                                    WHEN COALESCE(detalle.cant_bulto, 0) = 0
                                     AND COALESCE(detalle.cant_caja, 0) = 0
                                     AND COALESCE(detalle.cant_x_caja, 0) = 0
                                     AND COALESCE(detalle.cant_fraccion, 0) = 0
                                     AND COALESCE(detalle.cantidad_total, detalle.cantidad, 0) > 0
                                    THEN 1
                                    ELSE COALESCE(detalle.cant_caja, 0)
                                END AS cant_caja,
                                CASE
                                    WHEN COALESCE(detalle.cant_bulto, 0) = 0
                                     AND COALESCE(detalle.cant_caja, 0) = 0
                                     AND COALESCE(detalle.cant_x_caja, 0) = 0
                                     AND COALESCE(detalle.cant_fraccion, 0) = 0
                                     AND COALESCE(detalle.cantidad_total, detalle.cantidad, 0) > 0
                                    THEN COALESCE(detalle.cantidad_total, detalle.cantidad)
                                    ELSE COALESCE(detalle.cant_x_caja, 0)
                                END AS cant_x_caja,
                                CASE
                                    WHEN COALESCE(detalle.cant_bulto, 0) = 0
                                     AND COALESCE(detalle.cant_caja, 0) = 0
                                     AND COALESCE(detalle.cant_x_caja, 0) = 0
                                     AND COALESCE(detalle.cant_fraccion, 0) = 0
                                     AND COALESCE(detalle.cantidad_total, detalle.cantidad, 0) > 0
                                    THEN 0
                                    ELSE COALESCE(detalle.cant_fraccion, 0)
                                END AS cant_fraccion,
                prod.codigo AS producto_codigo,
                prod.descripcion AS producto_descripcion,
                prod.unidad_medida AS producto_unidad_medida
            FROM nota_salida_detalles detalle
            INNER JOIN notas_salida nota ON nota.id = detalle.nota_salida_id
            LEFT JOIN clientes cliente ON cliente.id = nota.cliente_id
            LEFT JOIN productos prod ON prod.id = detalle.producto_id
                        LEFT JOIN (
                                SELECT referencia_id, producto_id, MIN(NULLIF(lote_numero, '')) AS lote_numero
                                FROM kardex
                                WHERE tipo_movimiento = 'SALIDA'
                                    AND lote_numero IS NOT NULL
                                    AND lote_numero <> ''
                                GROUP BY referencia_id, producto_id
                        ) kardex_fallback
                            ON kardex_fallback.referencia_id = nota.id
                         AND kardex_fallback.producto_id = detalle.producto_id
                        LEFT JOIN lotes lote_fallback
                            ON lote_fallback.id = COALESCE(
                                detalle.lote_id,
                                (SELECT l2.id FROM lotes l2
                                 WHERE l2.producto_id = detalle.producto_id
                                   AND l2.numero_lote = COALESCE(NULLIF(detalle.lote_numero, ''), NULLIF(detalle.lote_numero, '-'), kardex_fallback.lote_numero)
                                 LIMIT 1)
                            )
                        LEFT JOIN (
                                SELECT producto_id, MAX(CASE WHEN um IS NOT NULL AND um <> '' AND um <> '-' THEN um END) AS um
                                FROM nota_salida_detalles
                                GROUP BY producto_id
                        ) um_fallback
                            ON um_fallback.producto_id = detalle.producto_id
            WHERE (
                $1 = ''
                OR nota.numero_salida ILIKE $2
                OR prod.codigo ILIKE $3
                OR prod.descripcion ILIKE $4
                OR COALESCE(NULLIF(detalle.lote_numero, ''), NULLIF(detalle.lote_numero, '-'), kardex_fallback.lote_numero, '') ILIKE $5
                OR COALESCE(nota.numero_documento, '') ILIKE $6
                OR COALESCE(nota.cliente_ruc, '') ILIKE $7
                OR COALESCE(cliente.cuit, '') ILIKE $8
                OR COALESCE(cliente.razon_social, '') ILIKE $9
                OR COALESCE(cliente.codigo, '') ILIKE $10
                OR COALESCE(nota.motivo_salida, '') ILIKE $11
            )
            ORDER BY nota.fecha DESC, nota.id DESC, detalle.id ASC
            LIMIT $12
        `;

        const rows = await fastify.db.query(sql, [
            termino,
            like,
            like,
            like,
            like,
            like,
            like,
            like,
            like,
            like,
            like,
            Number(limit)
        ]);

        return {
            success: true,
            data: rows
        };
    });

    // GET /api/salidas/:id - Obtener nota con detalles
    fastify.get('/api/salidas/:id', {
        schema: {
            tags: ['Salidas'],
            description: 'Obtener una nota de salida específica con sus detalles',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: NotaSalidaResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de salida no encontrada' });
        }

        const cliente = nota.cliente_id ? await clienteRepo.findOneBy({ id: Number(nota.cliente_id) }) : null;

        // Obtener detalles con JOIN para traer los productos
        const detalles = await notaSalidaDetalleRepo
            .createQueryBuilder('detalle')
            .leftJoinAndSelect('detalle.producto', 'producto')
            .leftJoinAndSelect('detalle.lote', 'lote')
            .where('detalle.nota_salida_id = :notaId', { notaId: Number(id) })
            .getMany();

        return {
            success: true,
            data: {
                ...nota,
                cliente,
                detalles: detalles
            }
        };
    });

    // POST /api/salidas - Crear nota de salida
    fastify.post('/api/salidas', {
        schema: {
            tags: ['Salidas'],
            description: 'Crear una nueva nota de salida con sus detalles',
            body: {
                type: 'object',
                required: ['detalles'],
                properties: {
                    cliente_id: { type: 'integer' },
                    cliente_ruc: { type: 'string' },
                    fecha: { type: 'string', format: 'date' },
                    observaciones: { type: 'string' },
                    detalles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['producto_id', 'cantidad'],
                            properties: {
                                producto_id: { type: 'integer' },
                                cantidad: { type: 'number', exclusiveMinimum: 0 },
                                precio_unitario: { type: 'number', minimum: 0, nullable: true },
                                cant_bulto: { type: 'number', minimum: 0 },
                                cant_caja: { type: 'number', minimum: 0 },
                                cant_x_caja: { type: 'number', minimum: 0 },
                                cant_fraccion: { type: 'number', minimum: 0 },
                                lote_id: { type: ['integer', 'null'] },
                                lote_numero: { type: ['string', 'null'] }
                            }
                        }
                    },
                    tipo_documento: { type: 'string', nullable: true },
                    numero_documento: { type: 'string', nullable: true },
                    fecha_ingreso: { type: 'string', nullable: true },
                    motivo_salida: { type: 'string', nullable: true },
                    responsable_id: { type: 'integer', nullable: true }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: NotaSalidaSchema,
                        message: { type: 'string' }
                    }
                },
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { cliente_id, cliente_ruc, fecha, responsable_id, detalles, observaciones,
            tipo_documento, numero_documento, fecha_ingreso, motivo_salida } = request.body;
        if (!cliente_id || !Array.isArray(detalles) || !detalles.length) {
            return reply.code(400).send({ success: false, error: 'Cliente y detalles son obligatorios' });
        }
        try {
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) return reply.code(404).send({ success: false, error: 'Cliente no encontrado' });
            const notaGuardada = await fastify.db.transaction(async tx => {
                await lockDocumentNumbers(tx);
                const numeroSalida = await generarNumeroSalida();
                const nota = await tx.save('NotaSalida', notaSalidaRepo.create({
                    numero_salida: numeroSalida, cliente_id: cliente.id, cliente_ruc: cliente.cuit || cliente_ruc || null,
                    fecha: fecha || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }),
                    responsable_id: request.user.id, tipo_documento: tipo_documento || null,
                    numero_documento: numero_documento || null, fecha_ingreso: fecha_ingreso || null,
                    motivo_salida: motivo_salida || null, observaciones: observaciones || null, estado: 'REGISTRADA'
                }));
                await applyDetails(tx, nota, detalles, cliente);
                await audit(tx, request, 'CREAR', 'notas_salida', nota.id, null, { ...nota, detalles });
                return nota;
            });
            return reply.code(201).send({ success: true, data: notaGuardada, message: 'Nota de salida creada exitosamente' });
        } catch (error) { return reply.code(400).send({ success: false, error: error.message }); }
    });

    // PUT /api/salidas/:id - Actualizar nota de salida con detalles
    fastify.put('/api/salidas/:id', {
        schema: {
            tags: ['Salidas'],
            description: 'Actualizar una nota de salida existente incluyendo detalles',
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
                    estado: { type: 'string' },
                    observaciones: { type: 'string' },
                    cliente_id: { type: ['integer', 'string', 'null'] },
                    cliente_ruc: { type: ['string', 'null'] },
                    fecha: { type: ['string', 'null'] },
                    responsable_id: { type: ['integer', 'string', 'null'] },
                    tipo_documento: { type: 'string', nullable: true },
                    numero_documento: { type: 'string', nullable: true },
                    fecha_ingreso: { type: 'string', nullable: true },
                    motivo_salida: { type: 'string', nullable: true },
                    detalles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', nullable: true },
                                producto_id: { type: 'integer' },
                                cantidad: { type: 'number' },
                                cant_bulto: { type: 'number' },
                                cant_caja: { type: 'number' },
                                cant_x_caja: { type: 'number' },
                                cant_fraccion: { type: 'number' },
                                lote_id: { type: ['integer', 'null'] },
                                lote_numero: { type: ['string', 'null'] }
                            }
                        }
                    }
                }
            },
            response: {
                200: NotaSalidaResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            const result = await fastify.db.transaction(async tx => {
                const nota = await tx.findOne('NotaSalida', { where: { id: Number(request.params.id) }, lock: { mode: 'pessimistic_write' } });
                if (!nota) throw Object.assign(new Error('Nota de salida no encontrada'), { statusCode: 404 });
                if (nota.estado === 'CANCELADA') throw new Error('Una salida cancelada no se puede editar');
                const before = { ...nota };
                const body = request.body;
                const cliente = await tx.findOne('Cliente', { where: { id: Number(body.cliente_id ?? nota.cliente_id) } });
                if (!cliente) throw new Error('Cliente no encontrado');
                if (body.cliente_id !== undefined && Number(body.cliente_id) !== Number(nota.cliente_id) && !body.detalles) {
                    throw new Error('Para cambiar el cliente debe enviar y validar todos los detalles');
                }
                nota.cliente_id = cliente.id;
                nota.cliente_ruc = cliente.cuit || null;
                for (const field of ['fecha', 'observaciones', 'tipo_documento', 'numero_documento', 'fecha_ingreso', 'motivo_salida']) {
                    if (Object.prototype.hasOwnProperty.call(body, field)) nota[field] = body[field] || null;
                }
                if (!nota.fecha) throw new Error('La fecha es obligatoria');
                if (body.estado) {
                    if (!['REGISTRADA', 'DESPACHO_PENDIENTE', 'DESPACHADA', 'COMPLETADA', 'PARCIAL'].includes(body.estado)) throw new Error('Estado no permitido');
                    nota.estado = body.estado;
                }
                let anteriores;
                if (body.detalles !== undefined) {
                    if (!Array.isArray(body.detalles) || !body.detalles.length) throw new Error('La salida debe tener al menos un detalle');
                    const previous = await tx.find('NotaSalidaDetalle', { where: { nota_salida_id: nota.id } });
                    await lockProducts(tx, [...previous, ...body.detalles].map(detalle => detalle.producto_id));
                    anteriores = await restoreDetails(tx, nota);
                    await tx.delete('Kardex', { documento_tipo: 'NOTA_SALIDA', referencia_id: nota.id });
                    await tx.delete('NotaSalidaDetalle', { nota_salida_id: nota.id });
                    await applyDetails(tx, nota, body.detalles, cliente);
                }
                await tx.save('NotaSalida', nota);
                await audit(tx, request, 'ACTUALIZAR', 'notas_salida', nota.id,
                    { ...before, detalles: anteriores }, { ...nota, detalles: body.detalles });
                return nota;
            });
            return { success: true, data: result, message: 'Nota actualizada exitosamente' };
        } catch (error) { return reply.code(error.statusCode || 400).send({ success: false, error: error.message }); }
    });

    // DELETE /api/salidas/:id - Cancelar nota de salida
    fastify.delete('/api/salidas/:id', {
        schema: {
            tags: ['Salidas'],
            description: 'Cancelar una nota de salida (revierte cambios en Kardex y lotes)',
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
            await fastify.db.transaction(async tx => {
                const nota = await tx.findOne('NotaSalida', { where: { id: Number(request.params.id) }, lock: { mode: 'pessimistic_write' } });
                if (!nota) throw Object.assign(new Error('Nota de salida no encontrada'), { statusCode: 404 });
                if (nota.estado === 'CANCELADA') throw Object.assign(new Error('La salida ya está cancelada'), { statusCode: 409 });
                const previousStock = new Map();
                const detalles = await tx.find('NotaSalidaDetalle', { where: { nota_salida_id: nota.id } });
                await lockProducts(tx, detalles.map(detalle => detalle.producto_id));
                for (const detalle of detalles) if (!previousStock.has(detalle.producto_id)) previousStock.set(detalle.producto_id, await stock(tx, detalle.producto_id));
                await restoreDetails(tx, nota);
                for (const detalle of detalles) {
                    const saldo = Math.round((previousStock.get(detalle.producto_id) + Number(detalle.cantidad)) * 100) / 100;
                    previousStock.set(detalle.producto_id, saldo);
                    await tx.save('Kardex', {
                        producto_id: detalle.producto_id, lote_numero: detalle.lote_numero,
                        tipo_movimiento: 'SALIDA_REVERSA', cantidad: -Number(detalle.cantidad), saldo,
                        documento_tipo: 'NOTA_SALIDA_CANCELADA', documento_numero: nota.numero_salida, referencia_id: nota.id
                    });
                }
                await audit(tx, request, 'CANCELAR', 'notas_salida', nota.id, { ...nota, detalles }, { estado: 'CANCELADA' });
                nota.estado = 'CANCELADA';
                await tx.save('NotaSalida', nota);
                await tx.delete('NotaSalidaDetalle', { nota_salida_id: nota.id });
            });
            return { success: true, message: 'Nota de salida cancelada; stock restituido a sus lotes exactos' };
        } catch (error) { return reply.code(error.statusCode || 400).send({ success: false, error: error.message }); }
    });

    // POST /api/salidas/:id/despachar - Despachar nota
    fastify.post('/api/salidas/:id/despachar', {
        schema: {
            tags: ['Salidas'],
            description: 'Despachar una nota de salida',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: NotaSalidaResponseWithMessageSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        try {
            const result = await fastify.db.transaction(async tx => {
                const nota = await tx.findOne('NotaSalida', { where: { id: Number(request.params.id) }, lock: { mode: 'pessimistic_write' } });
                if (!nota) throw Object.assign(new Error('Nota no encontrada'), { statusCode: 404 });
                if (nota.estado === 'CANCELADA') throw new Error('Una nota cancelada no se puede reactivar');
                const before = { ...nota };
                nota.estado = 'DESPACHADA';
                await tx.save('NotaSalida', nota);
                await audit(tx, request, 'ACTUALIZAR', 'notas_salida', nota.id, before, nota);
                return nota;
            });
            return { success: true, data: result, message: 'Estado de la nota actualizado' };
        } catch (error) { return reply.code(error.statusCode || 400).send({ success: false, error: error.message }); }
    });

    // POST /api/salidas/importar - Importar desde Excel
    fastify.post('/api/salidas/importar', {
        schema: {
            tags: ['Salidas'],
            description: 'Importar notas de salida desde archivo Excel/CSV',
            consumes: ['multipart/form-data'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        errores: { type: 'array', items: { type: 'string' } }
                    }
                },
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        try {
            const errores = [];
            let generadas = 0;
            const buffer = await data.toBuffer();
            const fileName = String(data.filename || '').toLowerCase();
            const mimeType = String(data.mimetype || '').toLowerCase();

            let filas = [];

            if (fileName.endsWith('.csv') || fileName.endsWith('.txt') || mimeType.includes('csv') || mimeType.includes('text/plain')) {
                const rows = parseCSV(buffer.toString('utf8'));
                if (rows.length < 2) return reply.code(400).send({ success: false, error: 'El archivo no tiene datos' });
                filas = rows.slice(1).map((valores, index) => ({ rowNumber: index + 2, headers: rows[0], valores }));
            } else {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                const worksheet = workbook.worksheets[0];

                if (!worksheet || worksheet.rowCount < 2) {
                    return reply.status(400).send({ success: false, error: 'La hoja no tiene datos para importar' });
                }

                const headerRow = worksheet.getRow(1);
                const headers = [];
                for (let col = 1; col <= headerRow.cellCount; col++) {
                    headers.push(extraerStringCeldaExcel(headerRow.getCell(col).value));
                }

                for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                    const row = worksheet.getRow(rowNumber);
                    const valores = [];
                    for (let col = 1; col <= headers.length; col++) {
                        valores.push(extraerStringCeldaExcel(row.getCell(col).value));
                    }

                    if (!valores.some(v => String(v || '').trim() !== '')) continue;
                    filas.push({ rowNumber, headers, valores });
                }
            }

            const detallesParseados = [];
            const clienteTieneCuit = clienteRepo.metadata.columns.some(c => c.propertyName === 'cuit');

            for (const fila of filas) {
                const headerMap = mapearEncabezados(fila.headers);

                const codigoProducto = obtenerValor(fila.valores, headerMap, ['codigo_producto', 'cod. producto', 'cod producto', 'codproducto'], 3);
                const codigoCliente = obtenerValor(fila.valores, headerMap, ['codigo_cliente', 'codigo cliente', 'codcli'], null);
                const ruc = obtenerValor(fila.valores, headerMap, ['ruc', 'cuit', 'ruc_cliente', 'ruc cliente'], null);
                const cantidadTexto = obtenerValor(fila.valores, headerMap, ['cantidad', 'cant.total_salida', 'cant total salida', 'canttotalsalida'], 4);
                const precioTexto = obtenerValor(fila.valores, headerMap, ['precio', 'precio_unitario'], 5);
                const cantBultoTexto = obtenerValor(fila.valores, headerMap, ['cant.bulto', 'cant_bulto', 'cantidad_bultos'], null);
                const cantCajaTexto = obtenerValor(fila.valores, headerMap, ['cant.cajas', 'cant.caja', 'cant_cajas', 'cantidad_cajas'], null);
                const cantXCajaTexto = obtenerValor(fila.valores, headerMap, ['cant x caja', 'cant.x caja', 'cant_x_caja', 'cantidad_por_caja'], null);
                const cantFraccionTexto = obtenerValor(fila.valores, headerMap, ['cant.fraccion', 'cant_fraccion', 'cantidad_fraccion'], null);
                const motivoSalida = obtenerValor(fila.valores, headerMap, ['motivo de salida', 'motivo_salida'], null);
                const tipoDocumentoSalida = obtenerValor(fila.valores, headerMap, ['tipo_documento', 'tipo documento', 'tipo doc', 'tipo de documento'], null);
                const numeroDocumentoSalida = obtenerValor(fila.valores, headerMap, ['numero_documento', 'numero documento', 'nro_documento', 'nro documento', 'num_documento', 'num documento', 'numero_guia', 'numero guia', 'nro_guia', 'nro guia', 'n guia', 'n° guia', 'guia', 'guia salida', 'guia de salida'], null);
                const fechaIngresoTexto = obtenerValor(fila.valores, headerMap, ['fecha_ingreso', 'fecha ingreso'], null);
                const loteNumero = obtenerValor(fila.valores, headerMap, ['lote', 'numero_lote'], null);
                const fechaVctoTexto = obtenerValor(fila.valores, headerMap, ['fecha vcto', 'fecha_vencimiento'], null);
                const umTexto = obtenerValor(fila.valores, headerMap, ['um', 'unidad_medida', 'unidad de medida'], null);

                const fechaSalidaTexto = obtenerValor(fila.valores, headerMap, ['fecha', 'fecha de h_salida', 'fecha_salida', 'ano', 'año', 'columna1'], 0);
                const mesAux = obtenerValor(fila.valores, headerMap, ['mes'], null);
                const diaAux = obtenerValor(fila.valores, headerMap, ['dia'], null);
                let fechaSalidaFinal = fechaSalidaTexto;
                const fechaPreliminar = parsearFecha(fechaSalidaTexto, mesAux, diaAux);
                if (!fechaPreliminar) {
                    const col1 = obtenerValor(fila.valores, headerMap, ['columna1'], null);
                    if (col1) fechaSalidaFinal = col1;
                }

                const fecha = fechaPreliminar || parsearFecha(fechaSalidaFinal, mesAux, diaAux);
                const fechaSql = toSqlDate(fecha);
                const cantidad = parsearNumero(cantidadTexto);
                const precio = parsearNumero(precioTexto);
                const cantBulto = parsearNumero(cantBultoTexto);
                const cantCaja = parsearNumero(cantCajaTexto);
                const cantXCaja = parsearNumero(cantXCajaTexto);
                const cantFraccion = parsearNumero(cantFraccionTexto);
                const numeroDocumentoLimpio = String(numeroDocumentoSalida || '').trim();
                const tipoDocumentoFinal = String(tipoDocumentoSalida || '').trim() || (numeroDocumentoLimpio ? 'Guía de Remisión Remitente' : null);

                if (!fechaSql || !codigoProducto || cantidad <= 0) {
                    errores.push(`Fila ${fila.rowNumber}: Faltan datos obligatorios (fecha/código producto/cantidad)`);
                    continue;
                }

                let cliente = null;
                const rucLimpio = String(ruc || '').trim();
                const codigoClienteLimpio = String(codigoCliente || '').trim();

                if (codigoClienteLimpio) {
                    cliente = await clienteRepo.findOneBy({ codigo: codigoClienteLimpio });
                }
                if (!cliente && rucLimpio) {
                    cliente = await clienteRepo.findOneBy({ codigo: rucLimpio });
                }
                if (!cliente && rucLimpio && clienteTieneCuit) {
                    cliente = await clienteRepo.findOneBy({ cuit: rucLimpio });
                }
                if (!cliente) {
                    errores.push(`Fila ${fila.rowNumber}: Cliente no encontrado (Código: ${codigoCliente || '-'} / RUC: ${ruc || '-'})`);
                    continue;
                }

                // Buscar producto por (codigo + lote) — combinación única
                // Si viene lote en el CSV, usamos ambos para no confundir productos con mismo codigo pero distinto lote
                let producto = null;
                const loteNumeroLimpio = String(loteNumero || '').trim();

                if (loteNumeroLimpio) {
                    // Buscar el producto que tiene ese codigo Y tiene ese lote en su tabla de lotes Y corresponde al cliente
                    producto = await productoRepo
                        .createQueryBuilder('producto')
                        .innerJoin('producto.lotes', 'lote')
                        .where('producto.codigo = :codigo', { codigo: String(codigoProducto) })
                        .andWhere('lote.numero_lote = :lote', { lote: loteNumeroLimpio })
                        .andWhere('(producto.cliente_id = :clienteId OR producto.cliente_ruc = :clienteRuc)', { clienteId: cliente.id, clienteRuc: cliente.cuit })
                        .getOne();

                    // Si no encontró por lotes, intentar por el campo lote directo del producto Y cliente
                    if (!producto) {
                        producto = await productoRepo.findOneBy({
                            codigo: String(codigoProducto),
                            lote: loteNumeroLimpio,
                            cliente_id: cliente.id
                        });
                    }
                }

                // Fallback: si no vino lote o no se encontró por lote, buscar solo por codigo Y cliente
                if (!producto) {
                    producto = await productoRepo.findOneBy({ 
                        codigo: String(codigoProducto),
                        cliente_id: cliente.id
                    });
                }

                if (!producto) {
                    errores.push(`Fila ${fila.rowNumber}: Producto no encontrado (código: ${codigoProducto}${loteNumeroLimpio ? ` / lote: ${loteNumeroLimpio}` : ''})`);
                    continue;
                }

                detallesParseados.push({
                    rowNumber: fila.rowNumber,
                    cliente,
                    producto,
                    fechaSql,
                    fechaIngresoSql: toSqlDate(parsearFecha(fechaIngresoTexto)),
                    motivoSalida: motivoSalida || null,
                    tipoDocumentoSalida: tipoDocumentoFinal,
                    numeroDocumentoSalida: numeroDocumentoLimpio || null,
                    loteNumero: loteNumero || null,
                    fechaVencimientoSql: toSqlDate(parsearFecha(fechaVctoTexto)),
                    um: umTexto || producto.unidad_medida || null,
                    cantidad: Number(cantidad),
                    precio: Number(precio) || null,
                    cant_bulto: String(cantBultoTexto || '').trim() !== '' ? Number(cantBulto) : null,
                    cant_caja: String(cantCajaTexto || '').trim() !== '' ? Number(cantCaja) : null,
                    cant_x_caja: String(cantXCajaTexto || '').trim() !== '' ? Number(cantXCaja) : null,
                    cant_fraccion: String(cantFraccionTexto || '').trim() !== '' ? Number(cantFraccion) : null
                });
            }

            const grupos = new Map();
            for (const item of detallesParseados) {
                const key = `${item.cliente.id}|${item.fechaSql}|${item.motivoSalida || ''}|${item.tipoDocumentoSalida || ''}|${item.numeroDocumentoSalida || ''}|${item.fechaIngresoSql || ''}`;
                if (!grupos.has(key)) {
                    grupos.set(key, {
                        cliente_id: item.cliente.id,
                        cliente_ruc: item.cliente.cuit || null,
                        fecha: item.fechaSql,
                        fecha_ingreso: item.fechaIngresoSql,
                        motivo_salida: item.motivoSalida,
                        tipo_documento: item.tipoDocumentoSalida,
                        numero_documento: item.numeroDocumentoSalida,
                        detalles: []
                    });
                }
                grupos.get(key).detalles.push(item);
            }

            for (const grupo of grupos.values()) {
                try {
                    await fastify.db.transaction(async (tx) => {
                        await lockDocumentNumbers(tx);
                        const numeroSalida = await generarNumeroSalida();

                        const nota = notaSalidaRepo.create({
                            numero_salida: numeroSalida,
                            cliente_id: grupo.cliente_id,
                            cliente_ruc: grupo.cliente_ruc || null,
                            fecha: grupo.fecha,
                            fecha_ingreso: grupo.fecha_ingreso,
                            responsable_id: request.user.id,
                            tipo_documento: grupo.tipo_documento,
                            numero_documento: grupo.numero_documento,
                            motivo_salida: grupo.motivo_salida,
                            observaciones: null,
                            estado: 'REGISTRADA'
                        });

                        const notaGuardada = await tx.save('NotaSalida', nota);

                        await applyDetails(tx, notaGuardada, grupo.detalles.map(d => ({
                            producto_id: d.producto.id, lote_numero: d.loteNumero, cantidad: d.cantidad,
                            precio_unitario: d.precio, um: d.um, cant_bulto: d.cant_bulto,
                            cant_caja: d.cant_caja, cant_x_caja: d.cant_x_caja, cant_fraccion: d.cant_fraccion
                        })), grupo.detalles[0].cliente);
                        await audit(tx, request, 'IMPORTAR', 'notas_salida', notaGuardada.id, null, notaGuardada);
                    });

                    generadas++;
                } catch (error) {
                    errores.push(error.message);
                }
            }

            return {
                success: errores.length === 0,
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
    fastify.get('/api/salidas/exportar', {
        schema: {
            tags: ['Salidas'],
            description: 'Exportar notas de salida a archivo Excel',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const notas = await notaSalidaRepo
            .createQueryBuilder('nota')
            .leftJoinAndMapOne('nota.cliente', 'clientes', 'cliente', 'cliente.id = nota.cliente_id')
            .orderBy('nota.created_at', 'DESC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Notas de Salida');

        worksheet.columns = [
            { header: 'Número Salida', key: 'numero_salida', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 30 },
            { header: 'Estado', key: 'estado', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        notas.forEach(nota => {
            worksheet.addRow({
                numero_salida: nota.numero_salida,
                fecha: formatCalendarDate(nota.fecha),
                cliente: nota.cliente?.razon_social || '- ',
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
    fastify.get('/api/salidas/plantilla/descargar', {
        schema: {
            tags: ['Salidas'],
            description: 'Descargar plantilla Excel para importar notas de salida',
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Plantilla Salida');

        worksheet.columns = [
            { header: 'ruc_cliente', key: 'ruc_cliente', width: 16 },
            { header: 'fecha', key: 'fecha', width: 15 },
            { header: 'tipo_documento', key: 'tipo_documento', width: 28 },
            { header: 'numero_documento', key: 'numero_documento', width: 22 },
            { header: 'motivo_salida', key: 'motivo_salida', width: 20 },
            { header: 'codigo_producto', key: 'codigo_producto', width: 20 },
            { header: 'lote', key: 'lote', width: 20 },
            { header: 'cantidad', key: 'cantidad', width: 12 },
            { header: 'um', key: 'um', width: 10 },
            { header: 'cant_bulto', key: 'cant_bulto', width: 12 },
            { header: 'cant_caja', key: 'cant_caja', width: 12 },
            { header: 'cant_x_caja', key: 'cant_x_caja', width: 12 },
            { header: 'cant_fraccion', key: 'cant_fraccion', width: 14 }
        ];

        worksheet.addRow({
            ruc_cliente: '20606511991',
            fecha: '17/03/2026',
            tipo_documento: 'Guía de Remisión Remitente',
            numero_documento: 'T001-00000123',
            motivo_salida: 'VENTA',
            codigo_producto: 'MED-001',
            lote: 'L-2026',
            cantidad: '10',
            um: 'UND',
            cant_bulto: '1',
            cant_caja: '1',
            cant_x_caja: '10',
            cant_fraccion: '0'
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=plantilla-salida.xlsx');
        return reply.send(buffer);
    });

    // GET /api/salidas/:id/pdf - Exportar PDF
    fastify.get('/api/salidas/:id/pdf', {
        schema: {
            tags: ['Salidas'],
            description: 'Generar PDF de una nota de salida',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: { type: 'string', format: 'binary' },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const nota = await notaSalidaRepo.findOne({
            where: { id: Number(id) }
        });

        if (!nota) return reply.status(404).send({ error: 'Nota no encontrada' });

        const detalles = await notaSalidaDetalleRepo.find({
            where: { nota_salida_id: nota.id },
            relations: ['producto', 'lote']
        });

        const cliente = await clienteRepo.findOneBy({ id: nota.cliente_id });

        // Calcular totales para el footer
        const totalBultos = detalles.reduce((acc, d) => acc + Number(d.cant_bulto || 0), 0);
        const totalCajas = detalles.reduce((acc, d) => acc + Number(d.cant_caja || 0), 0);
        const totalFraccion = detalles.reduce((acc, d) => acc + Number(d.cant_fraccion || 0), 0);
        const totalUnidades = detalles.reduce((acc, d) => acc + Number(d.cantidad_total || d.cantidad || 0), 0);

        // Path del logo (si existe)
        const logoPath = require('path').join(__dirname, '../assets/logo.png');
        const fs = require('fs');
        let logoImage = null;
        if (fs.existsSync(logoPath)) {
            logoImage = {
                image: logoPath,
                width: 150
            };
        } else {
            logoImage = { text: 'AGUPAL PERU', style: 'brand', fontSize: 20 };
        }

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
                        { text: 'NOTA DE SALIDA', style: 'headerTitle', alignment: 'center', margin: [0, 10, 0, 0] },
                        { text: `N° ${nota.numero_salida}`, style: 'headerNumber', alignment: 'right', margin: [0, 10, 0, 0] }
                    ],
                    margin: [0, 0, 0, 10]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 800, y2: 0, lineWidth: 1 }] },

                // Datos Cliente y Salida
                {
                    columns: [
                        {
                            width: '60%',
                            stack: [
                                {
                                    columns: [
                                        { text: 'Razón Social :', width: 80, style: 'labelBold' },
                                        { text: cliente?.razon_social || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Código Cliente :', width: 80, style: 'labelBold' },
                                        { text: cliente?.codigo || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'RUC :', width: 80, style: 'labelBold' },
                                        { text: cliente?.cuit || '-', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Dirección :', width: 80, style: 'labelBold' },
                                        { text: cliente?.direccion || '-', style: 'labelText' }
                                    ]
                                }
                            ],
                            margin: [0, 10, 0, 0]
                        },
                        {
                            width: '40%',
                            stack: [
                                {
                                    columns: [
                                        { text: 'Fecha de Salida:', width: '*', alignment: 'right', style: 'labelBold' },
                                        { text: String(nota.fecha).split('T')[0].split('-').reverse().join('/'), width: 100, alignment: 'right', style: 'labelText' }
                                    ]
                                },
                                {
                                    columns: [
                                        { text: 'Motivo:', width: '*', alignment: 'right', style: 'labelBold' },
                                        { text: nota.motivo_salida || '-', width: 100, alignment: 'right', style: 'labelText' }
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
                        widths: [20, 60, '*', 50, 50, 25, 80, 50, 40, 40, 40, 50, 50],
                        body: [
                            [
                                { text: 'Item', style: 'tableHeader' },
                                { text: 'Cod.Producto', style: 'tableHeader' },
                                { text: 'Producto', style: 'tableHeader' },
                                { text: 'Lote', style: 'tableHeader' },
                                { text: 'Fecha Vcto', style: 'tableHeader' },
                                { text: 'UM', style: 'tableHeader' },
                                { text: 'Fabri.', style: 'tableHeader' },
                                { text: 'Temp.', style: 'tableHeader' },
                                { text: 'Cant.Bulto', style: 'tableHeader' },
                                { text: 'Cant.Cajas', style: 'tableHeader' },
                                { text: 'Cant.x Caja', style: 'tableHeader' },
                                { text: 'Cant.Fracción', style: 'tableHeader' },
                                { text: 'Cant.Total', style: 'tableHeader' }
                            ],
                            ...detalles.map((d, idx) => [
                                { text: String(idx + 1), style: 'tableCell' },
                                { text: d.producto?.codigo || '-', style: 'tableCell' },
                                { text: d.producto?.descripcion || '-', style: 'tableCell', alignment: 'left' },
                                { text: d.lote_numero || (d.lote ? d.lote.numero_lote : null) || '-', style: 'tableCell' },
                                { text: d.fecha_vencimiento ? String(d.fecha_vencimiento).split('T')[0].split('-').reverse().join('/') : (d.lote?.fecha_vencimiento ? String(d.lote.fecha_vencimiento).split('T')[0].split('-').reverse().join('/') : '-'), style: 'tableCell' },
                                { text: d.um || d.producto?.unidad_medida || 'UND', style: 'tableCell' },
                                { text: d.fabricante || d.producto?.fabricante || '-', style: 'tableCell' },
                                { text: '15°C a 25°C', style: 'tableCell' },
                                { text: parseFloat(d.cant_bulto || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_caja || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_x_caja || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cant_fraccion || 0).toFixed(2), style: 'tableCell' },
                                { text: parseFloat(d.cantidad_total || d.cantidad).toFixed(2), style: 'tableCell' }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) { return 1; },
                        vLineWidth: function (i, node) { return 1; },
                        hLineColor: function (i, node) { return 'black'; },
                        vLineColor: function (i, node) { return 'black'; },
                        paddingLeft: function (i, node) { return 2; },
                        paddingRight: function (i, node) { return 2; },
                    }
                },

                // Footer
                {
                    columns: [
                        // Columna Izquierda (Motivos, Observaciones, Leyenda)
                        {
                            width: '*',
                            stack: [
                                {
                                    text: [
                                        { text: 'Motivo de la Salida:\n', bold: true, decoration: 'underline' },
                                        { text: nota.motivo_salida || '(Describir causa)' }
                                    ],
                                    margin: [0, 5, 0, 5]
                                },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5 }] },
                                {
                                    text: [
                                        { text: 'Observaciones:\n', bold: true, decoration: 'underline' },
                                        { text: nota.observaciones || '(Condiciones, daños, etc.)' }
                                    ],
                                    margin: [0, 5, 0, 5]
                                },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 0.5 }] },
                                {
                                    text: [
                                        { text: 'LEYENDA: ', bold: true },
                                        'Cant. Bulto: N° de cajas selladas (empaque primario)\n',
                                        { text: 'Cant. Cajas: ', bold: true }, 'N° de unidades por caja sellada\n',
                                        { text: 'Cant. x Caja: ', bold: true }, 'N° de unidades por caja abierta\n',
                                        { text: 'Cant. Fracción: ', bold: true }, 'Unidades sueltas\n',
                                        { text: 'Cant. Total: ', bold: true }, 'Total de unidades = (Bultos x Cajas x xCaja) + Saldo'
                                    ],
                                    style: 'legend',
                                    margin: [0, 5, 0, 0]
                                },
                                {
                                    text: `Son ${totalUnidades} unidades en total`,
                                    style: 'legend',
                                    margin: [0, 5, 0, 0]
                                },
                                {
                                    text: '(Resultado de sumar las unidades contenidas en los bultos, las cajas sueltas y las fracciones.)',
                                    style: 'legend',
                                    italics: true,
                                    color: 'gray'
                                }
                            ]
                        },
                        // Columna Derecha (Totales Grid)
                        {
                            width: 250,
                            table: {
                                widths: ['50%', '50%'],
                                body: [
                                    [
                                        { text: 'BULTOS', style: 'footerGridHeader' },
                                        { text: 'PALETS', style: 'footerGridHeader' }
                                    ],
                                    [
                                        { text: parseFloat(totalBultos).toFixed(2), style: 'footerGridValue', minHeight: 40 },
                                        { text: '', style: 'footerGridValue', minHeight: 40 }
                                    ],
                                    [
                                        { text: 'FRACCIONES', style: 'footerGridHeader' },
                                        { text: 'CANTIDAD TOTAL DE UNIDADES', style: 'footerGridHeader' }
                                    ],
                                    [
                                        { text: parseFloat(totalFraccion).toFixed(2), style: 'footerGridValue', minHeight: 40 },
                                        { text: parseFloat(totalUnidades).toFixed(2), style: 'footerGridValue', minHeight: 40 }
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
                                { text: 'JANETH T. NARVAEZ HUAMANI', style: 'labelText' },
                                { text: 'Jefe de Almacén' }
                            ],
                            alignment: 'center'
                        },
                        { stack: [{ text: '________________________' }, { text: 'Despachó' }], alignment: 'center' }
                    ],
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: {
                brand: { fontSize: 18, bold: true, color: '#0b6aa2' },
                headerTitle: { fontSize: 14, bold: true },
                headerNumber: { fontSize: 12, bold: true },
                labelBold: { fontSize: 8, bold: true },
                labelText: { fontSize: 8 },
                tableHeader: { fontSize: 7, bold: true, color: 'white', fillColor: 'black', alignment: 'center' },
                tableCell: { fontSize: 7, alignment: 'center' },
                footerGridHeader: { fontSize: 7, bold: true, fillColor: '#ffffff' },
                footerGridValue: { fontSize: 9, bold: true, alignment: 'center', margin: [0, 5, 0, 0] },
                legend: { fontSize: 6 }
            }
        };

        try {
            const buffer = await generatePDF(docDefinition);
            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `inline; filename=salida-${nota.numero_salida}.pdf`);
            return reply.send(buffer);
        } catch (error) {
            console.error('Error generando PDF:', error);
            return reply.status(500).send({
                success: false,
                error: 'Error al generar el PDF'
            });
        }
    });
}

module.exports = salidasRoutes;
