const ExcelJS = require('exceljs');

async function kardexRoutes(fastify, options) {
    const kardexRepo = fastify.db.getRepository('Kardex');
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/kardex - Listar movimientos
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

        const queryBuilder = kardexRepo.createQueryBuilder('kardex');

        if (producto_id) {
            queryBuilder.where('kardex.producto_id = :producto_id', { producto_id: Number(producto_id) });
        }

        if (request.query.lote_numero) {
            queryBuilder.andWhere('kardex.lote_numero = :lote_numero', { lote_numero: request.query.lote_numero });
        }

        if (tipo_movimiento) {
            queryBuilder.andWhere('kardex.tipo_movimiento = :tipo_movimiento', { tipo_movimiento });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('kardex.fecha >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('kardex.fecha <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder
            .orderBy(`kardex.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [movimientosData, total] = await queryBuilder.getManyAndCount();

        const movimientos = movimientosData.map(m => ({
            ...m,
            cantidad: Number(m.cantidad_entrada) || Number(m.cantidad_salida) || 0
        }));

        return {
            success: true,
            data: movimientos,
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
                movimientos: movimientos.map(m => ({
                    ...m,
                    cantidad: Number(m.cantidad_entrada) || Number(m.cantidad_salida) || 0
                }))
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
                cantidad: Number(mov.cantidad_entrada) || Number(mov.cantidad_salida) || 0,
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
