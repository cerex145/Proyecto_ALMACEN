const ExcelJS = require('exceljs');

// Schemas para documentación Swagger
const KardexMovimientoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        producto_id: { type: 'integer' },
        lote_numero: { type: 'string', nullable: true },
        tipo_movimiento: { type: 'string', enum: ['INGRESO', 'SALIDA', 'AJUSTE', 'AJUSTE_POR_RECEPCION'] },
        cantidad: { type: 'number' },
        saldo: { type: 'number' },
        documento_tipo: { type: 'string' },
        documento_numero: { type: 'string' },
        referencia_id: { type: 'integer', nullable: true },
        observaciones: { type: 'string', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
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

async function kardexRoutes(fastify, options) {
    const kardexRepo = fastify.db.getRepository('Kardex');
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/kardex - Listar movimientos (con datos del producto)
    fastify.get('/api/kardex', {
        schema: {
            tags: ['Kardex'],
            description: 'Listar movimientos de kardex con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    producto_id: { type: 'integer', description: 'Filtrar por ID de producto' },
                    producto_nombre: { type: 'string', description: 'Filtrar por nombre o código de producto' },
                    cliente_nombre: { type: 'string', description: 'Filtrar por nombre de cliente o proveedor' },
                    lote_id: { type: 'string', description: 'Filtrar por número de lote' },
                    tipo_movimiento: { type: 'string', enum: ['INGRESO', 'SALIDA', 'AJUSTE'], description: 'Tipo de movimiento' },
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
        const {
            producto_id,
            producto_nombre,
            cliente_nombre,
            lote_id,
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

        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.referencia_id, k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                COALESCE(ni.proveedor, c.razon_social) as cliente_nombre
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND k.referencia_id = ni.id AND k.tipo_movimiento = 'INGRESO'
            LEFT JOIN notas_salida ns ON k.documento_tipo = 'NOTA_SALIDA' AND k.referencia_id = ns.id AND k.tipo_movimiento = 'SALIDA'
            LEFT JOIN clientes c ON ns.cliente_id = c.id
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
            sql += ` AND COALESCE(ni.proveedor, c.razon_social) LIKE ?`;
            params.push(`%${cliente_nombre}%`);
        }

        if (lote_id) {
            sql += ` AND k.lote_numero LIKE ?`;
            params.push(`%${lote_id}%`);
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
        const allowedOrderFields = ['created_at', 'tipo_movimiento', 'cantidad', 'saldo', 'documento_tipo', 'documento_numero'];
        const normalizedOrderBy = orderBy === 'fecha' ? 'created_at' : orderBy;
        const safeOrderBy = allowedOrderFields.includes(normalizedOrderBy) ? normalizedOrderBy : 'created_at';
        const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        sql += ` ORDER BY k.${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;
        params.push(Number(limit), skip);

        const movimientos = await connection.query(sql, params);

        // Mapear a estructura esperada
        const data = movimientos.map(row => ({
            id: row.id,
            producto_id: row.producto_id,
            lote_numero: row.lote_numero,
            tipo_movimiento: row.tipo_movimiento,
            cantidad: Number(row.cantidad),
            saldo: Number(row.saldo),
            documento_tipo: row.documento_tipo,
            documento_numero: row.documento_numero,
            referencia_id: row.referencia_id,
            observaciones: row.observaciones,
            cliente_nombre: row.cliente_nombre || 'N/A',
            created_at: row.created_at,
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

        let sql = `
            SELECT 
                k.id, k.producto_id, k.lote_numero, k.tipo_movimiento,
                k.cantidad, k.saldo, k.documento_tipo, k.documento_numero,
                k.referencia_id, k.observaciones, k.created_at,
                p.codigo as codigo_producto, p.descripcion as descripcion_producto,
                COALESCE(ni.proveedor, c.razon_social) as cliente_nombre
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND k.referencia_id = ni.id AND k.tipo_movimiento = 'INGRESO'
            LEFT JOIN notas_salida ns ON k.documento_tipo = 'NOTA_SALIDA' AND k.referencia_id = ns.id AND k.tipo_movimiento = 'SALIDA'
            LEFT JOIN clientes c ON ns.cliente_id = c.id
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
            sql += ` AND COALESCE(ni.proveedor, c.razon_social) LIKE ?`;
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
                cliente_nombre: mov.cliente_nombre || 'N/A',
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
