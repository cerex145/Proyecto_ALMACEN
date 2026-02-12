const ExcelJS = require('exceljs');

async function kardexRoutes(fastify, options) {
    const kardexRepo = fastify.db.getRepository('Kardex');
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/kardex - Listar movimientos (con datos del producto)
    fastify.get('/api/kardex', async (request, reply) => {
        const {
            producto_id,
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
                p.codigo as codigo_producto, p.descripcion as descripcion_producto
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            WHERE 1=1
        `;

        const params = [];

        if (producto_id) {
            sql += ` AND k.producto_id = ?`;
            params.push(Number(producto_id));
        }

        if (lote_id) {
            sql += ` AND k.lote_numero = ?`;
            params.push(String(lote_id));
        }

        if (tipo_movimiento) {
            sql += ` AND k.tipo_movimiento = ?`;
            params.push(tipo_movimiento);
        }

        if (fecha_desde) {
            sql += ` AND k.created_at >= ?`;
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            sql += ` AND k.created_at <= ?`;
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
    fastify.get('/api/kardex/producto/:id', async (request, reply) => {
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
    fastify.get('/api/kardex/exportar', async (request, reply) => {
        const { producto_id } = request.query;

        let queryBuilder = kardexRepo.createQueryBuilder('kardex');

        if (producto_id) {
            queryBuilder = queryBuilder.where('kardex.producto_id = :producto_id', { producto_id: Number(producto_id) });
        }

        const movimientos = await queryBuilder
            .leftJoinAndSelect('kardex.producto', 'producto')
            .orderBy('kardex.created_at', 'ASC')
            .getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Kardex');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Código Producto', key: 'codigo_producto', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Número Lote', key: 'lote_numero', width: 20 },
            { header: 'Tipo Movimiento', key: 'tipo_movimiento', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Saldo', key: 'saldo', width: 15 },
            { header: 'Documento', key: 'documento', width: 20 },
            { header: 'Observaciones', key: 'observaciones', width: 40 }
        ];

        movimientos.forEach(mov => {
            worksheet.addRow({
                fecha: new Date(mov.created_at).toLocaleDateString('es-AR'),
                codigo_producto: mov.producto?.codigo || 'N/A',
                descripcion: mov.producto?.descripcion || 'N/A',
                lote_numero: mov.lote_numero || 'N/A',
                tipo_movimiento: mov.tipo_movimiento,
                cantidad: Number(mov.cantidad),
                saldo: Number(mov.saldo),
                documento: mov.documento_numero ? `${mov.documento_tipo}: ${mov.documento_numero}` : 'N/A',
                observaciones: mov.observaciones || ''
            });
        });

        // Agregar total final
        const totalRow = worksheet.addRow({
            fecha: '',
            codigo_producto: '',
            descripcion: 'TOTAL FINAL',
            lote_numero: '',
            tipo_movimiento: '',
            cantidad: '',
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
