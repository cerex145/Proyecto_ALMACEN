const ExcelJS = require('exceljs');

async function reportesRoutes(fastify, options) {
    const productoRepo = fastify.db.getRepository('Producto');
    const loteRepo = fastify.db.getRepository('Lote');
    const notaIngresoRepo = fastify.db.getRepository('NotaIngreso');
    const notaSalidaRepo = fastify.db.getRepository('NotaSalida');
    const kardexRepo = fastify.db.getRepository('Kardex');

    // GET /api/reportes/stock-actual - Stock actual por producto y lote
    fastify.get('/api/reportes/stock-actual', async (request, reply) => {
        const { incluir_lotes = false } = request.query;

        const productos = await productoRepo
            .createQueryBuilder('producto')
            .where('producto.activo = :activo', { activo: true })
            .orderBy('producto.descripcion', 'ASC')
            .getMany();

        let reporte = productos.map(p => ({
            id: p.id,
            codigo: p.codigo,
            descripcion: p.descripcion,
            proveedor: p.proveedor,
            categoria: p.categoria_ingreso,
            stock_actual: Number(p.stock_actual)
        }));

        if (incluir_lotes === 'true') {
            reporte = await Promise.all(
                reporte.map(async (prod) => {
                    const lotes = await loteRepo.find({
                        where: { producto_id: prod.id }
                    });
                    return {
                        ...prod,
                        lotes: lotes.map(l => ({
                            numero: l.numero_lote,
                            vencimiento: l.fecha_vencimiento,
                            cantidad: Number(l.cantidad_disponible)
                        }))
                    };
                })
            );
        }

        return {
            success: true,
            data: reporte,
            fecha_reporte: new Date().toISOString()
        };
    });

    // GET /api/reportes/ingresos - Ingresos por período
    fastify.get('/api/reportes/ingresos', async (request, reply) => {
        const { fecha_desde, fecha_hasta, proveedor } = request.query;

        const queryBuilder = notaIngresoRepo.createQueryBuilder('nota');

        if (fecha_desde) {
            queryBuilder.where('nota.fecha >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('nota.fecha <= :fecha_hasta', { fecha_hasta });
        }

        if (proveedor) {
            queryBuilder.andWhere('nota.proveedor LIKE :proveedor', { proveedor: `%${proveedor}%` });
        }

        const notas = await queryBuilder
            .orderBy('nota.fecha', 'DESC')
            .getMany();

        // Obtener detalles
        const reporte = await Promise.all(
            notas.map(async (nota) => {
                const detalleRepo = fastify.db.getRepository('NotaIngresoDetalle');
                const detalles = await detalleRepo.find({
                    where: { nota_ingreso_id: nota.id }
                });

                const total = detalles.reduce((sum, d) => 
                    sum + (Number(d.cantidad) * (Number(d.precio_unitario) || 0)), 0
                );

                return {
                    numero_ingreso: nota.numero_ingreso,
                    fecha: nota.fecha,
                    proveedor: nota.proveedor,
                    cantidad_productos: detalles.length,
                    cantidad_total_unidades: detalles.reduce((sum, d) => sum + Number(d.cantidad), 0),
                    monto_total: total,
                    estado: nota.estado
                };
            })
        );

        const totales = {
            total_ingresos: reporte.length,
            total_unidades: reporte.reduce((sum, r) => sum + r.cantidad_total_unidades, 0),
            monto_total: reporte.reduce((sum, r) => sum + r.monto_total, 0)
        };

        return {
            success: true,
            data: reporte,
            totales,
            fecha_reporte: new Date().toISOString()
        };
    });

    // GET /api/reportes/salidas - Salidas por cliente
    fastify.get('/api/reportes/salidas', async (request, reply) => {
        const { fecha_desde, fecha_hasta, cliente_id } = request.query;

        const queryBuilder = notaSalidaRepo.createQueryBuilder('nota');

        if (fecha_desde) {
            queryBuilder.where('nota.fecha >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('nota.fecha <= :fecha_hasta', { fecha_hasta });
        }

        if (cliente_id) {
            queryBuilder.andWhere('nota.cliente_id = :cliente_id', { cliente_id: Number(cliente_id) });
        }

        const notas = await queryBuilder
            .leftJoinAndSelect('nota.cliente', 'cliente')
            .orderBy('nota.fecha', 'DESC')
            .getMany();

        // Obtener detalles
        const reporte = await Promise.all(
            notas.map(async (nota) => {
                const detalleRepo = fastify.db.getRepository('NotaSalidaDetalle');
                const detalles = await detalleRepo.find({
                    where: { nota_salida_id: nota.id }
                });

                const total = detalles.reduce((sum, d) => 
                    sum + (Number(d.cantidad) * (Number(d.precio_unitario) || 0)), 0
                );

                return {
                    numero_salida: nota.numero_salida,
                    fecha: nota.fecha,
                    cliente_codigo: nota.cliente?.codigo || 'N/A',
                    cliente_nombre: nota.cliente?.razon_social || 'N/A',
                    cantidad_productos: detalles.length,
                    cantidad_total_unidades: detalles.reduce((sum, d) => sum + Number(d.cantidad), 0),
                    monto_total: total,
                    estado: nota.estado
                };
            })
        );

        const totales = {
            total_salidas: reporte.length,
            total_unidades: reporte.reduce((sum, r) => sum + r.cantidad_total_unidades, 0),
            monto_total: reporte.reduce((sum, r) => sum + r.monto_total, 0)
        };

        return {
            success: true,
            data: reporte,
            totales,
            fecha_reporte: new Date().toISOString()
        };
    });

    // GET /api/reportes/productos-por-categoria - Productos por categoría de ingreso
    fastify.get('/api/reportes/productos-por-categoria', async (request, reply) => {
        const categorias = ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'];

        const reporte = await Promise.all(
            categorias.map(async (categoria) => {
                const productos = await productoRepo.find({
                    where: { categoria_ingreso: categoria, activo: true }
                });

                const stockTotal = productos.reduce((sum, p) => sum + Number(p.stock_actual), 0);

                return {
                    categoria,
                    cantidad_productos: productos.length,
                    stock_total: stockTotal,
                    productos: productos.map(p => ({
                        codigo: p.codigo,
                        descripcion: p.descripcion,
                        stock: Number(p.stock_actual)
                    }))
                };
            })
        );

        const totales = {
            total_categorias: reporte.filter(r => r.cantidad_productos > 0).length,
            total_productos: reporte.reduce((sum, r) => sum + r.cantidad_productos, 0),
            stock_total: reporte.reduce((sum, r) => sum + r.stock_total, 0)
        };

        return {
            success: true,
            data: reporte,
            totales,
            fecha_reporte: new Date().toISOString()
        };
    });

    // GET /api/reportes/exportar - Exportar reporte completo
    fastify.get('/api/reportes/exportar', async (request, reply) => {
        const { tipo = 'completo' } = request.query;

        const workbook = new ExcelJS.Workbook();

        // Hoja 1: Stock Actual
        const wsStock = workbook.addWorksheet('Stock Actual');
        wsStock.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Proveedor', key: 'proveedor', width: 20 },
            { header: 'Categoría', key: 'categoria', width: 15 },
            { header: 'Stock', key: 'stock', width: 12 }
        ];

        const productos = await productoRepo.find({ where: { activo: true } });
        productos.forEach(p => {
            wsStock.addRow({
                codigo: p.codigo,
                descripcion: p.descripcion,
                proveedor: p.proveedor || 'N/A',
                categoria: p.categoria_ingreso || 'N/A',
                stock: Number(p.stock_actual)
            });
        });

        // Hoja 2: Ingresos
        const wsIngresos = workbook.addWorksheet('Ingresos');
        wsIngresos.columns = [
            { header: 'Número', key: 'numero', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Proveedor', key: 'proveedor', width: 30 },
            { header: 'Estado', key: 'estado', width: 20 }
        ];

        const ingresos = await notaIngresoRepo.find();
        ingresos.forEach(i => {
            wsIngresos.addRow({
                numero: i.numero_ingreso,
                fecha: new Date(i.fecha).toLocaleDateString('es-AR'),
                proveedor: i.proveedor,
                estado: i.estado
            });
        });

        // Hoja 3: Salidas
        const wsSalidas = workbook.addWorksheet('Salidas');
        wsSalidas.columns = [
            { header: 'Número', key: 'numero', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 30 },
            { header: 'Estado', key: 'estado', width: 20 }
        ];

        const salidas = await notaSalidaRepo.find({ relations: ['cliente'] });
        salidas.forEach(s => {
            wsSalidas.addRow({
                numero: s.numero_salida,
                fecha: new Date(s.fecha).toLocaleDateString('es-AR'),
                cliente: s.cliente?.razon_social || 'N/A',
                estado: s.estado
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', `attachment; filename=reporte-${new Date().toISOString().split('T')[0]}.xlsx`);
        return reply.send(buffer);
    });
}

module.exports = reportesRoutes;
