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

    const parsearNumero = (valor) => {
        if (valor === null || valor === undefined || valor === '') return 0;
        const texto = String(valor).trim();
        if (texto === '-' || texto.toLowerCase() === 'n/a') return 0;

        const sinEspacios = texto.replace(/\s/g, '');
        const tieneComa = sinEspacios.includes(',');
        const tienePunto = sinEspacios.includes('.');

        let normalizado = sinEspacios;
        if (tieneComa && tienePunto) {
            normalizado = normalizado.replace(/\./g, '').replace(',', '.');
        } else if (tieneComa) {
            normalizado = normalizado.replace(',', '.');
        }

        normalizado = normalizado.replace(/[^0-9.-]/g, '');
        return Number.parseFloat(normalizado) || 0;
    };

    const obtenerStockDisponiblePorLotes = async (entityManager, productoId) => {
        const resultado = await entityManager
            .createQueryBuilder('Lote', 'lote')
            .select('COALESCE(SUM(lote.cantidad_disponible), 0)', 'stock')
            .where('lote.producto_id = :productoId', { productoId: Number(productoId) })
            .getRawOne();

        return Number(resultado?.stock || 0);
    };

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
                            ON lote_fallback.producto_id = detalle.producto_id
                         AND lote_fallback.numero_lote = COALESCE(NULLIF(detalle.lote_numero, ''), NULLIF(detalle.lote_numero, '-'), kardex_fallback.lote_numero)
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
                                cantidad: { type: 'number', minimum: 0 },
                                cant_bulto: { type: 'number', minimum: 0 },
                                cant_caja: { type: 'number', minimum: 0 },
                                cant_x_caja: { type: 'number', minimum: 0 },
                                cant_fraccion: { type: 'number', minimum: 0 },
                                lote_id: { type: 'integer' }
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
        const {
            cliente_id,
            cliente_ruc,
            fecha,
            responsable_id,
            detalles,
            observaciones,
            tipo_documento,
            numero_documento,
            fecha_ingreso,
            motivo_salida
        } = request.body;

        // Debug: loguear request
        console.log('📝 POST /api/salidas body:', JSON.stringify({ cliente_id, fecha, detalles, responsable_id }, null, 2));

        // Validaciones detalladas
        if (!cliente_id) {
            return reply.status(400).send({ success: false, error: 'Campo obligatorio: cliente_id' });
        }
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return reply.status(400).send({ success: false, error: 'Detalles debe ser un array con al menos un item' });
        }

        const fechaFinal = fecha || new Date().toISOString().split('T')[0];

        try {
            // Verificar cliente
            const cliente = await clienteRepo.findOneBy({ id: Number(cliente_id) });
            if (!cliente) {
                return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
            }

            // Validar estructura de detalles
            for (const detalle of detalles) {
                if (!detalle.producto_id || !detalle.cantidad || Number(detalle.cantidad) <= 0) {
                    return reply.status(400).send({ success: false, error: 'Cada detalle debe incluir producto_id y cantidad > 0' });
                }
            }

            // Validar stock por lotes por producto (Primera barrera)
            const EPSILON = 0.001; // Margen para flotantes
            const totalPorProducto = new Map();
            for (const detalle of detalles) {
                const pid = Number(detalle.producto_id);
                totalPorProducto.set(pid, (totalPorProducto.get(pid) || 0) + Number(detalle.cantidad));
            }

            for (const [pid, totalCantidad] of totalPorProducto.entries()) {
                const producto = await productoRepo.findOneBy({ id: pid });
                if (!producto) {
                    throw new Error(`Producto ${pid} no encontrado`);
                }
                const stock = await obtenerStockDisponiblePorLotes(fastify.db, pid);
                // Validación con epsilon
                if (stock + EPSILON < totalCantidad) {
                    throw new Error(`Stock insuficiente para ${producto.descripcion}. Disponible: ${stock.toFixed(2)}, Solicitado: ${totalCantidad.toFixed(2)}`);
                }
            }

            const numeroSalida = await generarNumeroSalida();

            // Crear objeto nota base
            const nota = notaSalidaRepo.create({
                numero_salida: numeroSalida,
                cliente_id: Number(cliente_id),
                cliente_ruc: cliente.cuit || cliente_ruc || null,
                fecha: fechaFinal,
                responsable_id,
                tipo_documento: tipo_documento || null,
                numero_documento: numero_documento || null,
                fecha_ingreso: fecha_ingreso || null,
                motivo_salida: motivo_salida || null,
                observaciones,
                estado: 'REGISTRADA'
            });

            // TRANSACCIÓN PRINCIPAL
            let notaGuardada = null;
            await fastify.db.transaction(async (tx) => {
                notaGuardada = await tx.save('NotaSalida', nota);

                for (const detalle of detalles) {
                    const pid = Number(detalle.producto_id);
                    const cantidadSolicitada = Number(detalle.cantidad);
                    const precioUnitario = detalle.precio_unitario;
                    const cantBulto = parsearNumero(detalle.cant_bulto);
                    const cantCaja = parsearNumero(detalle.cant_caja);
                    const cantXCaja = parsearNumero(detalle.cant_x_caja);
                    const cantFraccion = parsearNumero(detalle.cant_fraccion);

                    const producto = await tx.findOne('Producto', { where: { id: pid } });

                    // CASO 1: Lote específico seleccionado
                    if (detalle.lote_id) {
                        const lote = await tx.findOne('Lote', { where: { id: Number(detalle.lote_id) } });
                        if (!lote) throw new Error(`Lote ${detalle.lote_id} no encontrado`);

                        if (Number(lote.cantidad_disponible) + EPSILON < cantidadSolicitada) {
                            throw new Error(`Stock insuficiente en lote ${lote.numero_lote}. Disponible: ${Number(lote.cantidad_disponible).toFixed(2)}`);
                        }

                        // Actualizar Lote
                        lote.cantidad_disponible = Number(lote.cantidad_disponible) - cantidadSolicitada;
                        if (lote.cantidad_disponible < 0) lote.cantidad_disponible = 0;
                        await tx.save('Lote', lote);

                        // Crear Detalle
                        const detalleNota = notaSalidaDetalleRepo.create({
                            nota_salida_id: notaGuardada.id,
                            producto_id: pid,
                            lote_numero: lote.numero_lote || null,
                            fecha_vencimiento: lote.fecha_vencimiento || null,
                            um: producto.unidad_medida || null,
                            fabricante: producto.fabricante || null,
                            cantidad: cantidadSolicitada,
                            cant_bulto: detalle.cant_bulto != null ? Number(cantBulto) : null,
                            cant_caja: detalle.cant_caja != null ? Number(cantCaja) : null,
                            cant_x_caja: detalle.cant_x_caja != null ? Number(cantXCaja) : null,
                            cant_fraccion: detalle.cant_fraccion != null ? Number(cantFraccion) : null,
                            cantidad_total: cantidadSolicitada
                        });
                        await tx.save('NotaSalidaDetalle', detalleNota);

                        // Kardex
                        const movimiento = kardexRepo.create({
                            producto_id: pid,
                            lote_numero: lote.numero_lote,
                            tipo_movimiento: 'SALIDA',
                            cantidad: cantidadSolicitada,
                            saldo: Number(lote.cantidad_disponible),
                            documento_tipo: 'NOTA_SALIDA',
                            documento_numero: numeroSalida,
                            referencia_id: notaGuardada.id
                        });
                        await tx.save('Kardex', movimiento);

                    }
                    // CASO 2: Selección Automática FIFO (Sin Lote)
                    else {
                        // Buscar lotes con stock > 0, ordenados por vencimiento o creación
                        const lotesDisponibles = await tx.find('Lote', {
                            where: {
                                producto_id: pid,
                                cantidad_disponible: MoreThan(0.00)
                            },
                            order: {
                                fecha_vencimiento: 'ASC',
                                created_at: 'ASC'
                            }
                        });

                        let pendiente = cantidadSolicitada;

                        for (const lote of lotesDisponibles) {
                            if (pendiente <= EPSILON) break;

                            const disponible = Number(lote.cantidad_disponible);
                            const aTomar = Math.min(disponible, pendiente);

                            // Actualizar Lote
                            lote.cantidad_disponible = disponible - aTomar;
                            await tx.save('Lote', lote);

                            // Crear Detalle (Uno por cada lote usado)
                            const detalleNota = notaSalidaDetalleRepo.create({
                                nota_salida_id: notaGuardada.id,
                                producto_id: pid,
                                lote_numero: lote.numero_lote || null,
                                fecha_vencimiento: lote.fecha_vencimiento || null,
                                um: producto.unidad_medida || null,
                                fabricante: producto.fabricante || null,
                                cantidad: aTomar,
                                cant_bulto: detalle.cant_bulto != null ? Number(cantBulto) : null,
                                cant_caja: detalle.cant_caja != null ? Number(cantCaja) : null,
                                cant_x_caja: detalle.cant_x_caja != null ? Number(cantXCaja) : null,
                                cant_fraccion: detalle.cant_fraccion != null ? Number(cantFraccion) : null,
                                cantidad_total: aTomar
                            });
                            await tx.save('NotaSalidaDetalle', detalleNota);

                            // Kardex
                            // Nota: El saldo aquí es un poco delicado en batch, pero usaremos el stock global actual menos lo acumulado
                            const movimiento = kardexRepo.create({
                                producto_id: pid,
                                lote_numero: lote.numero_lote,
                                tipo_movimiento: 'SALIDA',
                                cantidad: aTomar,
                                saldo: Number(lote.cantidad_disponible),
                                documento_tipo: 'NOTA_SALIDA',
                                documento_numero: numeroSalida,
                                referencia_id: notaGuardada.id
                            });
                            await tx.save('Kardex', movimiento);

                            pendiente -= aTomar;
                        }

                        // Verificación final de integridad
                        if (pendiente > EPSILON) {
                            const stockDisponible = await obtenerStockDisponiblePorLotes(tx, pid);
                            throw new Error(`Inconsistencia en lotes para ${producto.descripcion}. Disponible por lotes: ${stockDisponible.toFixed(2)}, faltaron: ${pendiente.toFixed(2)}`);
                        }
                    }
                }
            });

            return reply.status(201).send({
                success: true,
                data: notaGuardada,
                message: 'Nota de salida creada exitosamente'
            });

        } catch (error) {
            console.error('❌ Error en POST /api/salidas:', error);
            return reply.status(400).send({
                success: false,
                error: error.message || 'Error al crear nota de salida'
            });
        }
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
                                lote_id: { type: 'integer' }
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
        const { id } = request.params;
        const { estado, observaciones, detalles } = request.body;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de salida no encontrada' });
        }

        try {
            await fastify.db.transaction(async (transactionalEntityManager) => {
                // Actualizar campos básicos de la nota
                if (estado) nota.estado = estado;
                if (observaciones) nota.observaciones = observaciones;

                await transactionalEntityManager.save('NotaSalida', nota);

                // Si se envían detalles, actualizar toda la estructura
                if (detalles && Array.isArray(detalles) && detalles.length > 0) {
                    // Obtener detalles anteriores para revertir cambios en lotes
                    const detallesAntiguos = await transactionalEntityManager.find('NotaSalidaDetalle', {
                        where: { nota_salida_id: Number(id) }
                    });

                    // Revertir cambios en lotes y Kardex de los detalles anteriores
                    for (const detalleAntiguo of detallesAntiguos) {
                        // Encontrar el lote usado en esta salida
                        const lotes = await transactionalEntityManager.find('Lote', {
                            where: {
                                numero_lote: detalleAntiguo.lote_numero,
                                producto_id: detalleAntiguo.producto_id
                            }
                        });

                        for (const lote of lotes) {
                            // Restaurar cantidad disponible en lote
                            lote.cantidad_disponible = Number(lote.cantidad_disponible) + Number(detalleAntiguo.cantidad);
                            await transactionalEntityManager.save('Lote', lote);
                        }

                        // Crear movimiento de reversa en Kardex
                        const movimientoReversa = kardexRepo.create({
                            producto_id: detalleAntiguo.producto_id,
                            lote_numero: detalleAntiguo.lote_numero,
                            tipo_movimiento: 'SALIDA_REVERSA',
                            cantidad: -Number(detalleAntiguo.cantidad),
                            saldo: Number(detalleAntiguo.cantidad),
                            documento_tipo: 'NOTA_SALIDA',
                            documento_numero: nota.numero_salida,
                            referencia_id: nota.id
                        });
                        await transactionalEntityManager.save('Kardex', movimientoReversa);
                    }

                    // Eliminar detalles antiguos
                    await transactionalEntityManager.delete('NotaSalidaDetalle', { nota_salida_id: Number(id) });

                    // Validar stock disponible antes de aplicar nuevos detalles
                    const EPSILON = 0.001;
                    const totalPorProducto = new Map();
                    for (const detalle of detalles) {
                        const pid = Number(detalle.producto_id);
                        totalPorProducto.set(pid, (totalPorProducto.get(pid) || 0) + Number(detalle.cantidad));
                    }

                    for (const [pid, totalCantidad] of totalPorProducto.entries()) {
                        const producto = await transactionalEntityManager.findOne('Producto', { where: { id: pid } });
                        if (!producto) {
                            throw new Error(`Producto ${pid} no encontrado`);
                        }
                        const stock = await obtenerStockDisponiblePorLotes(transactionalEntityManager, pid);
                        if (stock + EPSILON < totalCantidad) {
                            throw new Error(`Stock insuficiente para ${producto.descripcion}. Disponible: ${stock.toFixed(2)}, Solicitado: ${totalCantidad.toFixed(2)}`);
                        }
                    }

                    // Insertar nuevos detalles
                    for (const detalle of detalles) {
                        const pid = Number(detalle.producto_id);
                        const cantidadSolicitada = Number(detalle.cantidad);

                        const producto = await transactionalEntityManager.findOne('Producto', { where: { id: pid } });
                        if (!producto) {
                            throw new Error(`Producto ${pid} no encontrado`);
                        }

                        // CASO 1: Lote específico seleccionado
                        if (detalle.lote_id) {
                            const lote = await transactionalEntityManager.findOne('Lote', { where: { id: Number(detalle.lote_id) } });
                            if (!lote) throw new Error(`Lote ${detalle.lote_id} no encontrado`);

                            if (Number(lote.cantidad_disponible) + EPSILON < cantidadSolicitada) {
                                throw new Error(`Stock insuficiente en lote ${lote.numero_lote}. Disponible: ${Number(lote.cantidad_disponible).toFixed(2)}`);
                            }

                            // Actualizar Lote
                            lote.cantidad_disponible = Number(lote.cantidad_disponible) - cantidadSolicitada;
                            if (lote.cantidad_disponible < 0) lote.cantidad_disponible = 0;
                            await transactionalEntityManager.save('Lote', lote);

                            // Crear Detalle
                            const detalleNota = notaSalidaDetalleRepo.create({
                                nota_salida_id: nota.id,
                                producto_id: pid,
                                lote_numero: lote.numero_lote || null,
                                fecha_vencimiento: lote.fecha_vencimiento || null,
                                um: producto.unidad_medida || null,
                                fabricante: producto.fabricante || null,
                                cantidad: cantidadSolicitada,
                                cant_bulto: detalle.cant_bulto != null ? Number(detalle.cant_bulto) : null,
                                cant_caja: detalle.cant_caja != null ? Number(detalle.cant_caja) : null,
                                cant_x_caja: detalle.cant_x_caja != null ? Number(detalle.cant_x_caja) : null,
                                cant_fraccion: detalle.cant_fraccion != null ? Number(detalle.cant_fraccion) : null,
                                cantidad_total: cantidadSolicitada
                            });
                            await transactionalEntityManager.save('NotaSalidaDetalle', detalleNota);

                            // Kardex
                            const movimiento = kardexRepo.create({
                                producto_id: pid,
                                lote_numero: lote.numero_lote,
                                tipo_movimiento: 'SALIDA',
                                cantidad: cantidadSolicitada,
                                saldo: Number(lote.cantidad_disponible),
                                documento_tipo: 'NOTA_SALIDA',
                                documento_numero: nota.numero_salida,
                                referencia_id: nota.id
                            });
                            await transactionalEntityManager.save('Kardex', movimiento);
                        }
                        // CASO 2: Selección Automática FIFO (Sin Lote)
                        else {
                            const lotesDisponibles = await transactionalEntityManager.find('Lote', {
                                where: {
                                    producto_id: pid,
                                    cantidad_disponible: MoreThan(0.00)
                                },
                                order: {
                                    fecha_vencimiento: 'ASC',
                                    created_at: 'ASC'
                                }
                            });

                            let pendiente = cantidadSolicitada;

                            for (const lote of lotesDisponibles) {
                                if (pendiente <= EPSILON) break;

                                const disponible = Number(lote.cantidad_disponible);
                                const aTomar = Math.min(disponible, pendiente);

                                // Actualizar Lote
                                lote.cantidad_disponible = disponible - aTomar;
                                await transactionalEntityManager.save('Lote', lote);

                                // Crear Detalle
                                const detalleNota = notaSalidaDetalleRepo.create({
                                    nota_salida_id: nota.id,
                                    producto_id: pid,
                                    lote_numero: lote.numero_lote || null,
                                    fecha_vencimiento: lote.fecha_vencimiento || null,
                                    um: producto.unidad_medida || null,
                                    fabricante: producto.fabricante || null,
                                    cantidad: aTomar,
                                    cant_bulto: detalle.cant_bulto != null ? Number(detalle.cant_bulto) : null,
                                    cant_caja: detalle.cant_caja != null ? Number(detalle.cant_caja) : null,
                                    cant_x_caja: detalle.cant_x_caja != null ? Number(detalle.cant_x_caja) : null,
                                    cant_fraccion: detalle.cant_fraccion != null ? Number(detalle.cant_fraccion) : null,
                                    cantidad_total: aTomar
                                });
                                await transactionalEntityManager.save('NotaSalidaDetalle', detalleNota);

                                // Kardex
                                const movimiento = kardexRepo.create({
                                    producto_id: pid,
                                    lote_numero: lote.numero_lote,
                                    tipo_movimiento: 'SALIDA',
                                    cantidad: aTomar,
                                    saldo: Number(lote.cantidad_disponible),
                                    documento_tipo: 'NOTA_SALIDA',
                                    documento_numero: nota.numero_salida,
                                    referencia_id: nota.id
                                });
                                await transactionalEntityManager.save('Kardex', movimiento);

                                pendiente -= aTomar;
                            }

                            if (pendiente > EPSILON) {
                                const stockDisponible = await obtenerStockDisponiblePorLotes(transactionalEntityManager, pid);
                                throw new Error(`Inconsistencia en lotes. Disponible: ${stockDisponible.toFixed(2)}, faltaron: ${pendiente.toFixed(2)}`);
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                data: nota,
                message: 'Nota actualizada exitosamente'
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({
                success: false,
                error: error.message || 'Error al actualizar la nota'
            });
        }
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
        const { id } = request.params;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota de salida no encontrada' });
        }

        try {
            await fastify.db.transaction(async (transactionalEntityManager) => {
                // Obtener todos los detalles de la nota
                const detalles = await transactionalEntityManager.find('NotaSalidaDetalle', {
                    where: { nota_salida_id: Number(id) }
                });

                // Revertir cada detalle
                for (const detalle of detalles) {
                    // Encontrar lotes y restaurar cantidad
                    const lotes = await transactionalEntityManager.find('Lote', {
                        where: {
                            numero_lote: detalle.lote_numero,
                            producto_id: detalle.producto_id
                        }
                    });

                    for (const lote of lotes) {
                        lote.cantidad_disponible = Number(lote.cantidad_disponible) + Number(detalle.cantidad);
                        await transactionalEntityManager.save('Lote', lote);
                    }

                    // Crear movimiento de reversa en Kardex
                    const movimientoReversa = kardexRepo.create({
                        producto_id: detalle.producto_id,
                        lote_numero: detalle.lote_numero,
                        tipo_movimiento: 'SALIDA_REVERSA',
                        cantidad: -Number(detalle.cantidad),
                        saldo: Number(detalle.cantidad),
                        documento_tipo: 'NOTA_SALIDA_CANCELADA',
                        documento_numero: nota.numero_salida,
                        referencia_id: nota.id
                    });
                    await transactionalEntityManager.save('Kardex', movimientoReversa);
                }

                // Marcar nota como cancelada
                nota.estado = 'CANCELADA';
                nota.observaciones = (nota.observaciones || '') + ' | CANCELADO: ' + new Date().toLocaleString();
                await transactionalEntityManager.save('NotaSalida', nota);

                // Eliminar detalles
                await transactionalEntityManager.delete('NotaSalidaDetalle', { nota_salida_id: Number(id) });
            });

            return {
                success: true,
                message: `Nota de salida ${nota.numero_salida} cancelada exitosamente. Los cambios han sido revertidos en la base de datos.`
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(400).send({
                success: false,
                error: error.message || 'Error al cancelar la nota'
            });
        }
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
        const { id } = request.params;

        const nota = await notaSalidaRepo.findOneBy({ id: Number(id) });
        if (!nota) {
            return reply.status(404).send({ success: false, error: 'Nota no encontrada' });
        }

        nota.estado = 'DESPACHADA';
        await notaSalidaRepo.save(nota);

        return {
            success: true,
            data: nota,
            message: 'Nota despachada exitosamente'
        };
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
                        message: { type: 'string' }
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
                const contenido = buffer.toString('utf8');
                const lineas = contenido.split(/\r?\n/).filter(l => l.trim());

                if (lineas.length < 2) {
                    return reply.status(400).send({ success: false, error: 'El archivo no tiene datos' });
                }

                const delimitador = detectarDelimitador(lineas[0]);
                const headers = lineas[0].split(delimitador).map(h => h.trim());

                for (let i = 1; i < lineas.length; i++) {
                    const valores = lineas[i].split(delimitador).map(v => v.trim());
                    filas.push({ rowNumber: i + 1, headers, valores });
                }
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
                const ruc = obtenerValor(fila.valores, headerMap, ['ruc', 'cuit'], null);
                const cantidadTexto = obtenerValor(fila.valores, headerMap, ['cantidad', 'cant.total_salida', 'cant total salida', 'canttotalsalida'], 4);
                const precioTexto = obtenerValor(fila.valores, headerMap, ['precio', 'precio_unitario'], 5);
                const cantBultoTexto = obtenerValor(fila.valores, headerMap, ['cant.bulto', 'cant_bulto', 'cantidad_bultos'], null);
                const cantCajaTexto = obtenerValor(fila.valores, headerMap, ['cant.cajas', 'cant.caja', 'cant_cajas', 'cantidad_cajas'], null);
                const cantXCajaTexto = obtenerValor(fila.valores, headerMap, ['cant x caja', 'cant.x caja', 'cant_x_caja', 'cantidad_por_caja'], null);
                const cantFraccionTexto = obtenerValor(fila.valores, headerMap, ['cant.fraccion', 'cant_fraccion', 'cantidad_fraccion'], null);
                const motivoSalida = obtenerValor(fila.valores, headerMap, ['motivo de salida', 'motivo_salida'], null);
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
                if (!cliente && rucLimpio && rucLimpio !== '-') {
                    cliente = await clienteRepo.save(clienteRepo.create({
                        codigo: rucLimpio,
                        razon_social: `CLIENTE ${rucLimpio}`
                    }));
                }
                if (!cliente) {
                    errores.push(`Fila ${fila.rowNumber}: Cliente no encontrado (Código: ${codigoCliente || '-'} / RUC: ${ruc || '-'})`);
                    continue;
                }

                const producto = await productoRepo.findOneBy({ codigo: String(codigoProducto) });
                if (!producto) {
                    errores.push(`Fila ${fila.rowNumber}: Producto no encontrado (${codigoProducto})`);
                    continue;
                }

                detallesParseados.push({
                    rowNumber: fila.rowNumber,
                    cliente,
                    producto,
                    fechaSql,
                    motivoSalida: motivoSalida || null,
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
                const key = `${item.cliente.id}|${item.fechaSql}|${item.motivoSalida || ''}`;
                if (!grupos.has(key)) {
                    grupos.set(key, {
                        cliente_id: item.cliente.id,
                        cliente_ruc: item.cliente.cuit || null,
                        fecha: item.fechaSql,
                        motivo_salida: item.motivoSalida,
                        detalles: []
                    });
                }
                grupos.get(key).detalles.push(item);
            }

            for (const grupo of grupos.values()) {
                try {
                    await fastify.db.transaction(async (tx) => {
                        const numeroSalida = await generarNumeroSalida();

                        const nota = notaSalidaRepo.create({
                            numero_salida: numeroSalida,
                            cliente_id: grupo.cliente_id,
                            cliente_ruc: grupo.cliente_ruc || null,
                            fecha: grupo.fecha,
                            responsable_id: 1,
                            motivo_salida: grupo.motivo_salida,
                            observaciones: null,
                            estado: 'REGISTRADA'
                        });

                        const notaGuardada = await tx.save('NotaSalida', nota);

                        for (const d of grupo.detalles) {
                            let saldoMovimiento = 0;
                            let loteId = null;

                            if (d.loteNumero) {
                                let lote = await tx.findOne('Lote', {
                                    where: {
                                        producto_id: d.producto.id,
                                        numero_lote: d.loteNumero
                                    }
                                });

                                if (!lote || Number(lote.cantidad_disponible || 0) < Number(d.cantidad)) {
                                    throw new Error(`Fila ${d.rowNumber}: Stock insuficiente en lote ${d.loteNumero}`);
                                }

                                lote.cantidad_disponible = Number(lote.cantidad_disponible) - Number(d.cantidad);
                                await tx.save('Lote', lote);
                                loteId = lote.id;
                                saldoMovimiento = Number(lote.cantidad_disponible);
                            } else {
                                const lotesDisponibles = await tx.find('Lote', {
                                    where: {
                                        producto_id: d.producto.id,
                                        cantidad_disponible: MoreThan(0.00)
                                    },
                                    order: {
                                        fecha_vencimiento: 'ASC',
                                        created_at: 'ASC'
                                    }
                                });

                                let pendiente = Number(d.cantidad);
                                for (const lote of lotesDisponibles) {
                                    if (pendiente <= 0) break;
                                    const disponible = Number(lote.cantidad_disponible || 0);
                                    if (disponible <= 0) continue;
                                    const aTomar = Math.min(disponible, pendiente);
                                    lote.cantidad_disponible = disponible - aTomar;
                                    await tx.save('Lote', lote);
                                    saldoMovimiento = Number(lote.cantidad_disponible);
                                    pendiente -= aTomar;
                                }

                                if (pendiente > 0) {
                                    throw new Error(`Fila ${d.rowNumber}: Stock insuficiente en lotes para ${d.producto.codigo}`);
                                }
                            }

                            const detalle = notaSalidaDetalleRepo.create({
                                nota_salida_id: notaGuardada.id,
                                producto_id: d.producto.id,
                                lote_id: loteId,
                                lote_numero: d.loteNumero,
                                fecha_vencimiento: d.fechaVencimientoSql,
                                um: d.um,
                                fabricante: d.producto.fabricante || null,
                                precio_unitario: d.precio,
                                cantidad: Number(d.cantidad),
                                cant_bulto: d.cant_bulto,
                                cant_caja: d.cant_caja,
                                cant_x_caja: d.cant_x_caja,
                                cant_fraccion: d.cant_fraccion,
                                cantidad_total: Number(d.cantidad)
                            });
                            await tx.save('NotaSalidaDetalle', detalle);

                            const movimiento = kardexRepo.create({
                                producto_id: d.producto.id,
                                lote_numero: d.loteNumero,
                                tipo_movimiento: 'SALIDA',
                                cantidad: Number(d.cantidad),
                                saldo: saldoMovimiento,
                                documento_tipo: 'NOTA_SALIDA',
                                documento_numero: numeroSalida,
                                referencia_id: notaGuardada.id
                            });
                            await tx.save('Kardex', movimiento);
                        }
                    });

                    generadas++;
                } catch (error) {
                    errores.push(error.message);
                }
            }

            return {
                success: true,
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
                fecha: new Date(nota.fecha).toLocaleDateString('es-AR'),
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
            { header: 'COD. PRODUCTO', key: 'codigo_producto', width: 20 },
            { header: 'PRODUCTO', key: 'producto', width: 45 },
            { header: 'LOTE', key: 'lote', width: 20 },
            { header: 'FECHA VCTO', key: 'fecha_vcto', width: 15 },
            { header: 'UM', key: 'um', width: 10 },
            { header: 'CANT.BULTO', key: 'cant_bulto', width: 12 },
            { header: 'CANT.CAJAS', key: 'cant_cajas', width: 12 },
            { header: 'CANT X CAJA', key: 'cant_x_caja', width: 12 },
            { header: 'CANT.FRACCIÓN', key: 'cant_fraccion', width: 14 },
            { header: 'CANT.TOTAL_SALIDA', key: 'cantidad', width: 18 },
            { header: 'FECHA DE H_SALIDA', key: 'fecha', width: 18 },
            { header: 'MES', key: 'mes', width: 8 },
            { header: 'DIA', key: 'dia', width: 8 },
            { header: 'RUC', key: 'ruc', width: 16 },
            { header: 'AÑO', key: 'anio', width: 10 },
            { header: 'MOTIVO DE SALIDA', key: 'motivo_salida', width: 20 }
        ];

        worksheet.addRow({
            codigo_producto: 'VK01111505',
            producto: 'VERTEBROPLASTY KIT',
            lote: '20250300006',
            fecha_vcto: '13/2/2028',
            um: 'UND',
            cant_bulto: '-',
            cant_cajas: '-',
            cant_x_caja: '-',
            cant_fraccion: '-',
            cantidad: '1',
            fecha: '15/1/2026',
            mes: '01',
            dia: '15',
            ruc: '20606511991',
            anio: '2026',
            motivo_salida: 'VENTA'
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
                                        { text: new Date(nota.fecha).toLocaleDateString('es-PE'), width: 100, alignment: 'right', style: 'labelText' }
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
                                { text: (d.lote ? d.lote.numero_lote : d.lote_numero) || '-', style: 'tableCell' },
                                { text: (d.lote ? new Date(d.lote.fecha_vencimiento).toLocaleDateString('es-PE') : (d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-')), style: 'tableCell' },
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
