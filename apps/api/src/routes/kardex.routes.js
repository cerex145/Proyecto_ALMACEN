const ExcelJS = require('exceljs');

// Schemas para documentación Swagger
const KardexMovimientoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote_numero: { type: 'string', nullable: true },
        tipo_movimiento: { type: 'string', enum: ['INGRESO', 'SALIDA', 'AJUSTE', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'AJUSTE_POR_RECEPCION'] },
        cantidad: { type: 'number' },
        saldo: { type: 'number' },
        documento_tipo: { type: 'string', nullable: true },
        documento_numero: { type: 'string', nullable: true },
        numero_guia: { type: 'string', nullable: true },
        referencia_id: { type: 'integer', nullable: true },
        observaciones: { type: 'string', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        // Campos adicionales del JOIN
        cliente_nombre: { type: 'string', nullable: true },
        proveedor: { type: 'string', nullable: true },
        cliente: { type: 'string', nullable: true },
        fecha_ingreso: { type: 'string', nullable: true },
        fecha_salida: { type: 'string', nullable: true },
        unidad_medida: { type: 'string', nullable: true },
        producto: {
            type: 'object',
            nullable: true,
            properties: {
                id: { type: 'integer' },
                codigo: { type: 'string', nullable: true },
                descripcion: { type: 'string', nullable: true }
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

async function kardexRoutes(fastify, options) {
    const kardexRepo = fastify.db.getRepository('Kardex');
    const productoRepo = fastify.db.getRepository('Producto');
    let kardexSchemaInfo = null;

    const getKardexSchemaInfo = async () => {
        if (kardexSchemaInfo) return kardexSchemaInfo;

        const rows = await kardexRepo.manager.connection.query(`
            SELECT TABLE_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = current_schema()
              AND (
                (TABLE_NAME = 'notas_salida' AND COLUMN_NAME = 'cliente_id')
                OR (TABLE_NAME = 'clientes' AND COLUMN_NAME = 'razon_social')
              )
        `);

                const flags = new Set(rows.map((row) => `${row.table_name}.${row.column_name}`));
        kardexSchemaInfo = {
            hasNotaSalidaClienteId: flags.has('notas_salida.cliente_id'),
            hasClienteRazonSocial: flags.has('clientes.razon_social')
        };

        return kardexSchemaInfo;
    };

    // Maintenance-only cleanup route. Disabled unless explicitly enabled in development.
    if (process.env.ENABLE_DANGEROUS_MAINTENANCE_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
    fastify.get('/api/kardex/testing/delete-hdm', async (request, reply) => {
        const queryRunner = kardexRepo.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const resClientes = await queryRunner.query(`
                SELECT id FROM clientes 
                WHERE cuit = '20605390332' OR razon_social ILIKE '%HDM%CAPITAL%'
            `);
            const clienteId = resClientes.length > 0 ? resClientes[0].id : -1;

            const ni = await queryRunner.query(`SELECT id FROM notas_ingreso WHERE cliente_ruc = '20605390332' OR proveedor_ruc = '20605390332' OR proveedor ILIKE '%HDM%CAPITAL%' OR cliente_id = $1`, [clienteId]);
            const niIds = ni.map(r => r.id);

            const ns = await queryRunner.query(`SELECT id FROM notas_salida WHERE cliente_id = $1`, [clienteId]);
            const nsIds = ns.map(r => r.id);

            let deletedKardexS = 0, deletedNs = 0, deletedKardexI = 0, deletedLotes = 0, deletedNi = 0;

            if (nsIds.length > 0) {
                const k1 = await queryRunner.query(`DELETE FROM kardex WHERE documento_tipo = 'NOTA_SALIDA' AND referencia_id = ANY($1) RETURNING id`, [nsIds]);
                deletedKardexS = k1.length;
                const d1 = await queryRunner.query(`DELETE FROM notas_salida WHERE id = ANY($1)`, [nsIds]);
                deletedNs = d1[1] || nsIds.length;
            }

            if (niIds.length > 0) {
                const k2 = await queryRunner.query(`DELETE FROM kardex WHERE documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND referencia_id = ANY($1) RETURNING id`, [niIds]);
                deletedKardexI = k2.length;
                const l1 = await queryRunner.query(`DELETE FROM lotes WHERE nota_ingreso_id = ANY($1)`, [niIds]);
                deletedLotes = l1[1] || niIds.length;
                const d2 = await queryRunner.query(`DELETE FROM notas_ingreso WHERE id = ANY($1)`, [niIds]);
                deletedNi = d2[1] || niIds.length;
            }

            await queryRunner.commitTransaction();
            const msg = `ÉXITO. Se eliminaron: Kardex Salidas (${deletedKardexS}), Notas Salida (${deletedNs}), Kardex Ingresos (${deletedKardexI}), Lotes (${deletedLotes}), Notas Ingreso (${deletedNi}). Cierra esta página y recarga el sistema.`;
            return { success: true, message: msg };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            return { success: false, error: err.message };
        } finally {
            await queryRunner.release();
        }
    });
    }

    // GET /api/kardex - Listar movimientos (con datos del producto)
    fastify.get('/api/kardex', {
        schema: {
            tags: ['Kardex'],
            description: 'Listar movimientos de kardex con filtros y paginación mejorados',
            querystring: {
                type: 'object',
                properties: {
                    producto_id: { type: 'integer', description: 'Filtrar por ID de producto' },
                    producto_codigo: { type: 'string', description: 'Filtrar por código de producto' },
                    producto_nombre: { type: 'string', description: 'Filtrar por nombre o descripción de producto' },
                    lote_numero: { type: 'string', description: 'Filtrar por número de lote' },
                    documento_numero: { type: 'string', description: 'Filtrar por número de documento' },
                    cliente_nombre: { type: 'string', description: 'Filtrar por nombre de cliente o proveedor' },
                    tipo_movimiento: { type: 'string', enum: ['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'AJUSTE_POR_RECEPCION'], description: 'Tipo de movimiento' },
                    fecha_desde: { type: 'string', format: 'date', description: 'Fecha inicio' },
                    fecha_hasta: { type: 'string', format: 'date', description: 'Fecha fin' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, default: 100 },
                    orderBy: { type: 'string', default: 'created_at' },
                    order: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array', items: KardexMovimientoSchema },
                        pagination: PaginationSchema
                    }
                }
            }
        }
    }, async (request, reply) => {
        const schemaInfo = await getKardexSchemaInfo();
        const {
            producto_id,
            producto_codigo,
            producto_nombre,
            lote_numero,
            documento_numero,
            cliente_nombre,
            tipo_movimiento,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 100,
            orderBy = 'created_at',
            order = 'DESC'
        } = request.query;

        const skip = (page - 1) * limit;
        let paramIndex = 1;

        // Query raw SQL para asegurar que trae los datos del producto
        const connection = kardexRepo.manager.connection;
        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                p.unidad_medida,
                ni.numero_ingreso,
                ni.numero_guia as numero_guia_sistema,
                ni.tipo_documento as tipo_documento_ingreso,
                ni.numero_documento as numero_documento_ingreso,
                ni.proveedor as proveedor_ingreso,
                ni.fecha as fecha_nota_ingreso,
                ns.numero_salida,
                ns.tipo_documento as tipo_documento_salida,
                ns.numero_documento as numero_documento_salida,
                ns.fecha as fecha_nota_salida,
                COALESCE(cliente_ingreso.razon_social, cliente_ingreso_ruc.razon_social) as cliente_nombre_ingreso,
                COALESCE(cliente_salida.razon_social, cliente_origen_salida.razon_social) as cliente_nombre_salida
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente')
                AND k.referencia_id = ni.id
                AND k.tipo_movimiento IN ('INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION')
            LEFT JOIN notas_salida ns ON k.documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA')
                AND k.referencia_id = ns.id
                AND k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA')
            LEFT JOIN clientes cliente_ingreso ON ni.cliente_id = cliente_ingreso.id
            LEFT JOIN clientes cliente_ingreso_ruc ON ni.cliente_id IS NULL
                AND regexp_replace(coalesce(cliente_ingreso_ruc.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(ni.cliente_ruc, ''), '\\D', '', 'g')
            LEFT JOIN clientes cliente_salida ON ns.cliente_id = cliente_salida.id
            LEFT JOIN LATERAL (
                SELECT
                    COALESCE(cliente_lote.razon_social, cliente_lote_ruc.razon_social) as razon_social,
                    COALESCE(cliente_lote.cuit, cliente_lote_ruc.cuit) as cuit
                FROM lotes lote_salida
                JOIN notas_ingreso ni_lote ON lote_salida.nota_ingreso_id = ni_lote.id
                LEFT JOIN clientes cliente_lote ON ni_lote.cliente_id = cliente_lote.id
                LEFT JOIN clientes cliente_lote_ruc ON ni_lote.cliente_id IS NULL
                    AND regexp_replace(coalesce(cliente_lote_ruc.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(ni_lote.cliente_ruc, ''), '\\D', '', 'g')
                WHERE k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA')
                    AND k.lote_numero IS NOT NULL
                    AND k.lote_numero != '-'
                    AND lote_salida.producto_id = k.producto_id
                    AND lote_salida.numero_lote = k.lote_numero
                ORDER BY lote_salida.id DESC
                LIMIT 1
            ) cliente_origen_salida ON true
            WHERE 1=1
        `;

        const params = [];

        if (producto_id) {
            sql += ` AND k.producto_id = $${paramIndex++}`;
            params.push(Number(producto_id));
        }

        if (producto_codigo) {
            sql += ` AND p.codigo ILIKE $${paramIndex++}`;
            params.push(`%${producto_codigo}%`);
        }

        if (producto_nombre) {
            sql += ` AND (p.descripcion ILIKE $${paramIndex++} OR p.codigo ILIKE $${paramIndex++})`;
            params.push(`%${producto_nombre}%`, `%${producto_nombre}%`);
        }

        if (documento_numero) {
            sql += ` AND (
                k.documento_numero ILIKE $${paramIndex}
                OR ni.numero_documento ILIKE $${paramIndex}
                OR ns.numero_documento ILIKE $${paramIndex}
                OR ni.numero_guia ILIKE $${paramIndex}
            )`;
            params.push(`%${documento_numero}%`);
            paramIndex++;
        }

        if (cliente_nombre) {
            // Mostrar INGRESO directo + SALIDA del cliente + SALIDA de productos que ese cliente ingresó
            sql += ` AND (
                COALESCE(cliente_ingreso.razon_social, cliente_ingreso_ruc.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_salida.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_origen_salida.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_ingreso.cuit, cliente_ingreso_ruc.cuit, cliente_salida.cuit, cliente_origen_salida.cuit, '') ILIKE $${paramIndex}
            )`;
            params.push(`%${cliente_nombre}%`);
            paramIndex++;
        }

        if (lote_numero) {
            sql += ` AND k.lote_numero ILIKE $${paramIndex++}`;
            params.push(`%${lote_numero}%`);
        }

        if (tipo_movimiento) {
            sql += ` AND k.tipo_movimiento = $${paramIndex++}`;
            params.push(tipo_movimiento);
        }

        if (fecha_desde) {
            sql += ` AND DATE(k.created_at) >= $${paramIndex++}`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ` AND DATE(k.created_at) <= $${paramIndex++}`;
            params.push(fecha_hasta);
        }

        // Total count
        const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await connection.query(countSql, params);
        const total = countResult[0]?.total || 0;

        // Order and pagination
        const allowedOrderFields = ['created_at', 'tipo_movimiento', 'cantidad', 'documento_numero', 'saldo'];
        const normalizedOrderBy = orderBy === 'fecha'
            ? 'created_at'
            : (orderBy === 'numero_documento' ? 'documento_numero' : orderBy);
        const safeOrderBy = allowedOrderFields.includes(normalizedOrderBy) ? normalizedOrderBy : 'created_at';
        const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        sql += ` ORDER BY k.${safeOrderBy} ${safeOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(Number(limit), skip);

        const movimientos = await connection.query(sql, params);

        const cleanText = (value) => String(value || '').trim();

        // Mapear a estructura esperada
        const data = movimientos.map(row => {
            const numeroDocumentoDigitado = row.numero_documento_ingreso || row.numero_documento_salida || null;

            return {
                id: row.id,
                producto_id: row.producto_id,
                lote_numero: row.lote_numero || null,
                tipo_movimiento: row.tipo_movimiento,
                cantidad: Number(row.cantidad),
                saldo: Number(row.saldo || 0),
                documento_tipo: row.documento_tipo || null,
                documento_numero: row.documento_numero || null,
                numero_guia: cleanText(numeroDocumentoDigitado) || null,
                observaciones: row.observaciones || '-',
                created_at: row.created_at,
                fecha_ingreso: row.fecha_nota_ingreso,
                fecha_salida: row.fecha_nota_salida,
                numero_ingreso: row.numero_ingreso || null,
                numero_salida: row.numero_salida || null,
                proveedor: row.proveedor_ingreso || null,
                cliente_nombre: cleanText(row.cliente_nombre_ingreso || row.cliente_nombre_salida) || null,
                unidad_medida: row.unidad_medida || null,
                producto: {
                    id: row.producto_id,
                    codigo: row.codigo_producto || 'N/A',
                    descripcion: row.descripcion_producto || 'N/A'
                }
            };
        });

        return {
            success: true,
            data: data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/kardex/producto/:id - Kardex por producto
    fastify.get('/api/kardex/producto/:id', {
        schema: {
            tags: ['Kardex'],
            description: 'Obtener todos los movimientos de kardex de un producto específico',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer', description: 'ID del producto' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                producto: { type: 'object' },
                                movimientos: { type: 'array', items: KardexMovimientoSchema }
                            }
                        }
                    }
                },
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        const producto = await productoRepo.findOneBy({ id: Number(id) });
        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        const movimientos = await kardexRepo
            .createQueryBuilder('kardex')
            .where('kardex.producto_id = :producto_id', { producto_id: Number(id) })
            .orderBy('kardex.created_at', 'DESC')
            .getMany();

        return {
            success: true,
            data: {
                producto,
                movimientos
            }
        };
    });

    // GET /api/kardex/exportar - Exportar a Excel
    fastify.get('/api/kardex/exportar', {
        schema: {
            tags: ['Kardex'],
            description: 'Exportar movimientos de kardex a Excel',
            querystring: {
                type: 'object',
                properties: {
                    producto_id: { type: 'integer', description: 'Filtrar por ID de producto' },
                    producto_nombre: { type: 'string', description: 'Filtrar por nombre o código de producto' },
                    cliente_nombre: { type: 'string', description: 'Filtrar por nombre de cliente o proveedor' },
                    fecha_desde: { type: 'string', format: 'date', description: 'Fecha inicio' },
                    fecha_hasta: { type: 'string', format: 'date', description: 'Fecha fin' },
                }
            },
            response: {
                200: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo Excel con movimientos de kardex'
                }
            }
        }
    }, async (request, reply) => {
        const { producto_id, producto_nombre, cliente_nombre, fecha_desde, fecha_hasta } = request.query;
        let paramIndex = 1;

        const connection = kardexRepo.manager.connection;
        await getKardexSchemaInfo();

        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.referencia_id, k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                ni.proveedor as proveedor_ingreso,
                ni.numero_guia as numero_guia_sistema,
                ni.tipo_documento as tipo_documento_ingreso,
                ni.numero_documento as numero_documento_ingreso,
                ni.fecha as fecha_nota_ingreso,
                ns.tipo_documento as tipo_documento_salida,
                ns.numero_documento as numero_documento_salida,
                ns.fecha as fecha_nota_salida,
                COALESCE(cliente_ingreso.razon_social, cliente_ingreso_ruc.razon_social) as cliente_nombre_ingreso,
                COALESCE(cliente_salida.razon_social, cliente_origen_salida.razon_social) as cliente_nombre_salida
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND k.referencia_id = ni.id AND k.tipo_movimiento IN ('INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION')
            LEFT JOIN notas_salida ns ON k.documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA') AND k.referencia_id = ns.id AND k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA')
            LEFT JOIN clientes cliente_ingreso ON ni.cliente_id = cliente_ingreso.id
            LEFT JOIN clientes cliente_ingreso_ruc ON ni.cliente_id IS NULL
                AND regexp_replace(coalesce(cliente_ingreso_ruc.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(ni.cliente_ruc, ''), '\\D', '', 'g')
            LEFT JOIN clientes cliente_salida ON ns.cliente_id = cliente_salida.id
            LEFT JOIN LATERAL (
                SELECT
                    COALESCE(cliente_lote.razon_social, cliente_lote_ruc.razon_social) as razon_social,
                    COALESCE(cliente_lote.cuit, cliente_lote_ruc.cuit) as cuit
                FROM lotes lote_salida
                JOIN notas_ingreso ni_lote ON lote_salida.nota_ingreso_id = ni_lote.id
                LEFT JOIN clientes cliente_lote ON ni_lote.cliente_id = cliente_lote.id
                LEFT JOIN clientes cliente_lote_ruc ON ni_lote.cliente_id IS NULL
                    AND regexp_replace(coalesce(cliente_lote_ruc.cuit, ''), '\\D', '', 'g') = regexp_replace(coalesce(ni_lote.cliente_ruc, ''), '\\D', '', 'g')
                WHERE k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA')
                    AND k.lote_numero IS NOT NULL
                    AND k.lote_numero != '-'
                    AND lote_salida.producto_id = k.producto_id
                    AND lote_salida.numero_lote = k.lote_numero
                ORDER BY lote_salida.id DESC
                LIMIT 1
            ) cliente_origen_salida ON true
            WHERE 1=1
        `;

        const params = [];

        if (producto_id) {
            sql += ` AND k.producto_id = $${paramIndex++}`;
            params.push(Number(producto_id));
        }

        if (producto_nombre) {
            sql += ` AND (p.descripcion ILIKE $${paramIndex++} OR p.codigo ILIKE $${paramIndex++})`;
            params.push(`%${producto_nombre}%`, `%${producto_nombre}%`);
        }

        if (cliente_nombre) {
            sql += ` AND (
                COALESCE(cliente_ingreso.razon_social, cliente_ingreso_ruc.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_salida.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_origen_salida.razon_social, '') ILIKE $${paramIndex}
                OR COALESCE(cliente_ingreso.cuit, cliente_ingreso_ruc.cuit, cliente_salida.cuit, cliente_origen_salida.cuit, '') ILIKE $${paramIndex}
            )`;
            params.push(`%${cliente_nombre}%`);
            paramIndex++;
        }

        if (fecha_desde) {
            sql += ` AND DATE(k.created_at) >= $${paramIndex++}`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ` AND DATE(k.created_at) <= $${paramIndex++}`;
            params.push(fecha_hasta);
        }

        sql += ` ORDER BY k.created_at ASC`;

        const movimientos = await connection.query(sql, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Kardex');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Documento', key: 'documento', width: 25 },
            { header: 'N Doc', key: 'documento_numero', width: 15 },
            { header: 'Guia', key: 'numero_guia', width: 18 },
            { header: 'Cliente', key: 'cliente_nombre', width: 40 },
            { header: 'Código Producto', key: 'codigo_producto', width: 15 },
            { header: 'Producto', key: 'descripcion', width: 40 },
            { header: 'Lote', key: 'lote_numero', width: 20 },
            { header: 'Tipo Mvto', key: 'tipo_movimiento', width: 20 },
            { header: 'Ingreso', key: 'ingreso', width: 15 },
            { header: 'Salida', key: 'salida', width: 15 },
            { header: 'Saldo', key: 'saldo', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        const formatFecha = (fechaVal, isDateOnly = false) => {
            if (!fechaVal) return '';
            try {
                if (fechaVal instanceof Date) {
                    if (isDateOnly) {
                        const year = fechaVal.getUTCFullYear();
                        const month = String(fechaVal.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(fechaVal.getUTCDate()).padStart(2, '0');
                        return `${day}/${month}/${year}`;
                    } else {
                        const year = fechaVal.getFullYear();
                        const month = String(fechaVal.getMonth() + 1).padStart(2, '0');
                        const day = String(fechaVal.getDate()).padStart(2, '0');
                        return `${day}/${month}/${year}`;
                    }
                }
                
                const str = String(fechaVal);
                if (str.includes('T')) {
                    const datePart = str.split('T')[0];
                    const partes = datePart.split('-');
                    if (partes.length === 3) {
                        return `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                } else {
                    const partes = str.split(' ')[0].split('-');
                    if (partes.length === 3) {
                        return `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }
                
                const d = new Date(fechaVal);
                if (!isNaN(d.getTime())) {
                    if (isDateOnly) {
                        const year = d.getUTCFullYear();
                        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(d.getUTCDate()).padStart(2, '0');
                        return `${day}/${month}/${year}`;
                    } else {
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${day}/${month}/${year}`;
                    }
                }
                return str;
            } catch (e) {
                return String(fechaVal);
            }
        };

        const cleanText = (value) => String(value || '').trim();

        movimientos.forEach(mov => {
            const isIngreso = mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'AJUSTE_POSITIVO' || mov.tipo_movimiento === 'AJUSTE_POR_RECEPCION';
            const isSalida = mov.tipo_movimiento === 'SALIDA' || mov.tipo_movimiento === 'AJUSTE_NEGATIVO' || mov.tipo_movimiento === 'SALIDA_REVERSA';
            
            const fechaDoc = isIngreso ? mov.fecha_nota_ingreso : (isSalida ? mov.fecha_nota_salida : null);
            const fechaFormateada = fechaDoc ? formatFecha(fechaDoc, true) : formatFecha(mov.created_at, false);
            const numeroDocumentoDigitado = mov.numero_documento_ingreso || mov.numero_documento_salida || null;

            worksheet.addRow({
                fecha: fechaFormateada,
                documento: mov.documento_tipo || 'N/A',
                documento_numero: mov.documento_numero || '',
                numero_guia: cleanText(numeroDocumentoDigitado) || '',
                cliente_nombre: cleanText(mov.cliente_nombre_ingreso || mov.cliente_nombre_salida) || 'N/A',
                codigo_producto: mov.codigo_producto || 'N/A',
                descripcion: mov.descripcion_producto || 'N/A',
                lote_numero: mov.lote_numero || '-',
                tipo_movimiento: mov.tipo_movimiento,
                ingreso: isIngreso ? Number(mov.cantidad) : '',
                salida: isSalida ? Number(mov.cantidad) : '',
                saldo: Number(mov.saldo),
                observaciones: mov.observaciones || ''
            });
        });

        // Agregar total final
        const totalRow = worksheet.addRow({
            fecha: '',
            documento: '',
            cliente_nombre: '',
            codigo_producto: '',
            descripcion: 'TOTAL FINAL',
            lote_numero: '',
            tipo_movimiento: '',
            ingreso: '',
            salida: '',
            saldo: movimientos.length > 0 ? Number(movimientos[movimientos.length - 1].saldo) : 0,
            documento: '',
            observaciones: ''
        });
        totalRow.font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=kardex.xlsx');
        return reply.send(buffer);
    });
}

module.exports = kardexRoutes;
