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
            WHERE TABLE_SCHEMA = DATABASE()
              AND (
                (TABLE_NAME = 'notas_salida' AND COLUMN_NAME = 'cliente_id')
                OR (TABLE_NAME = 'clientes' AND COLUMN_NAME = 'razon_social')
              )
        `);

        const flags = new Set(rows.map((row) => `${row.TABLE_NAME}.${row.COLUMN_NAME}`));
        kardexSchemaInfo = {
            hasNotaSalidaClienteId: flags.has('notas_salida.cliente_id'),
            hasClienteRazonSocial: flags.has('clientes.razon_social')
        };

        return kardexSchemaInfo;
    };

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

        // Query raw SQL para asegurar que trae los datos del producto
        const connection = kardexRepo.manager.connection;
        const clienteSelect = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'c.razon_social'
            : 'NULL';
        const clienteJoin = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'LEFT JOIN clientes c ON ns.cliente_id = c.id'
            : '';
        const clienteFilterExpr = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'COALESCE(ni.proveedor, c.razon_social)'
            : 'ni.proveedor';

        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                p.unidad_medida,
                ni.numero_ingreso,
                ni.proveedor as proveedor_ingreso,
                ni.fecha as fecha_nota_ingreso,
                ns.numero_salida,
                ns.fecha as fecha_nota_salida,
                ${clienteSelect} as cliente_nombre_salida
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente')
                AND k.referencia_id = ni.id
                AND k.tipo_movimiento IN ('INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION')
            LEFT JOIN notas_salida ns ON k.documento_tipo = 'NOTA_SALIDA'
                AND k.referencia_id = ns.id
                AND k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO')
            ${clienteJoin}
            WHERE 1=1
        `;

        const params = [];

        if (producto_id) {
            sql += ` AND k.producto_id = ?`;
            params.push(Number(producto_id));
        }

        if (producto_codigo) {
            sql += ` AND p.codigo LIKE ?`;
            params.push(`%${producto_codigo}%`);
        }

        if (producto_nombre) {
            sql += ` AND (p.descripcion LIKE ? OR p.codigo LIKE ?)`;
            params.push(`%${producto_nombre}%`, `%${producto_nombre}%`);
        }

        if (documento_numero) {
            sql += ` AND k.documento_numero LIKE ?`;
            params.push(`%${documento_numero}%`);
        }

        if (cliente_nombre) {
            sql += ` AND ${clienteFilterExpr} LIKE ?`;
            params.push(`%${cliente_nombre}%`);
        }

        if (lote_numero) {
            sql += ` AND k.lote_numero LIKE ?`;
            params.push(`%${lote_numero}%`);
        }

        if (tipo_movimiento) {
            sql += ` AND k.tipo_movimiento = ?`;
            params.push(tipo_movimiento);
        }

        if (fecha_desde) {
            sql += ` AND DATE(k.created_at) >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ` AND DATE(k.created_at) <= ?`;
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

        sql += ` ORDER BY k.${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;
        params.push(Number(limit), skip);

        const movimientos = await connection.query(sql, params);

        // Mapear a estructura esperada
        const data = movimientos.map(row => ({
            id: row.id,
            producto_id: row.producto_id,
            lote_numero: row.lote_numero || null,
            tipo_movimiento: row.tipo_movimiento,
            cantidad: Number(row.cantidad),
            saldo: Number(row.saldo || 0),
            documento_tipo: row.documento_tipo || null,
            documento_numero: row.documento_numero || null,
            observaciones: row.observaciones || '-',
            created_at: row.created_at,
            fecha_ingreso: row.fecha_nota_ingreso,
            fecha_salida: row.fecha_nota_salida,
            numero_ingreso: row.numero_ingreso || null,
            numero_salida: row.numero_salida || null,
            proveedor: row.proveedor_ingreso || null,
            cliente_nombre: row.proveedor_ingreso || row.cliente_nombre_salida || null,
            unidad_medida: row.unidad_medida || null,
            producto: {
                id: row.producto_id,
                codigo: row.codigo_producto || 'N/A',
                descripcion: row.descripcion_producto || 'N/A'
            }
        }));

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

        const connection = kardexRepo.manager.connection;
        const schemaInfo = await getKardexSchemaInfo();
        const clienteSelect = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'c.razon_social'
            : 'NULL';
        const clienteJoin = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'LEFT JOIN clientes c ON ns.cliente_id = c.id'
            : '';
        const clienteFilterExpr = schemaInfo.hasNotaSalidaClienteId && schemaInfo.hasClienteRazonSocial
            ? 'COALESCE(ni.proveedor, c.razon_social)'
            : 'ni.proveedor';

        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.referencia_id, k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                ni.proveedor as proveedor_ingreso,
                ${clienteSelect} as cliente_nombre_salida
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND k.referencia_id = ni.id AND k.tipo_movimiento = 'INGRESO'
            LEFT JOIN notas_salida ns ON k.documento_tipo = 'NOTA_SALIDA' AND k.referencia_id = ns.id AND k.tipo_movimiento = 'SALIDA'
            ${clienteJoin}
            WHERE 1=1
        `;

        const params = [];

        if (producto_id) {
            sql += ` AND k.producto_id = ?`;
            params.push(Number(producto_id));
        }

        if (producto_nombre) {
            sql += ` AND (p.descripcion LIKE ? OR p.codigo LIKE ?)`;
            params.push(`%${producto_nombre}%`, `%${producto_nombre}%`);
        }

        if (cliente_nombre) {
            sql += ` AND ${clienteFilterExpr} LIKE ?`;
            params.push(`%${cliente_nombre}%`);
        }

        if (fecha_desde) {
            sql += ` AND DATE(k.created_at) >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ` AND DATE(k.created_at) <= ?`;
            params.push(fecha_hasta);
        }

        sql += ` ORDER BY k.created_at ASC`;

        const movimientos = await connection.query(sql, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Kardex');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Documento', key: 'documento', width: 25 },
            { header: 'Cliente / Proveedor', key: 'cliente_nombre', width: 40 },
            { header: 'Código Producto', key: 'codigo_producto', width: 15 },
            { header: 'Producto', key: 'descripcion', width: 40 },
            { header: 'Lote', key: 'lote_numero', width: 20 },
            { header: 'Tipo Mvto', key: 'tipo_movimiento', width: 20 },
            { header: 'Ingreso', key: 'ingreso', width: 15 },
            { header: 'Salida', key: 'salida', width: 15 },
            { header: 'Saldo', key: 'saldo', width: 15 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        movimientos.forEach(mov => {
            const isIngreso = mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'AJUSTE_POSITIVO' || mov.tipo_movimiento === 'AJUSTE_POR_RECEPCION';
            const isSalida = mov.tipo_movimiento === 'SALIDA' || mov.tipo_movimiento === 'AJUSTE_NEGATIVO';

            worksheet.addRow({
                fecha: new Date(mov.created_at).toLocaleString('es-PE'),
                documento: mov.documento_numero ? `${mov.documento_tipo}: ${mov.documento_numero}` : 'N/A',
                cliente_nombre: mov.proveedor_ingreso || mov.cliente_nombre_salida || 'N/A',
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
