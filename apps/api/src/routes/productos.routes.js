const ExcelJS = require('exceljs');

async function productoRoutes(fastify, options) {
    const productoRepo = fastify.db.getRepository('Producto');

    // GET /api/productos - Listar con filtros y paginación
    fastify.get('/api/productos', async (request, reply) => {
        const { 
            busqueda = '', 
            activo, 
            page = 1, 
            limit = 50,
            orderBy = 'descripcion',
            order = 'ASC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = productoRepo.createQueryBuilder('producto');

        if (busqueda) {
            queryBuilder.where(
                '(producto.codigo LIKE :busqueda OR producto.descripcion LIKE :busqueda)',
                { busqueda: `%${busqueda}%` }
            );
        }

        if (activo !== undefined) {
            queryBuilder.andWhere('producto.activo = :activo', { activo: activo === 'true' });
        }

        queryBuilder
            .orderBy(`producto.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [productos, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: productos,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/productos/:id - Obtener un producto
    fastify.get('/api/productos/:id', async (request, reply) => {
        const { id } = request.params;
        const producto = await productoRepo.findOneBy({ id: Number(id) });

        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        return { success: true, data: producto };
    });

    // POST /api/productos - Crear producto
    fastify.post('/api/productos', async (request, reply) => {
        const { codigo, descripcion, stock_actual } = request.body;

        // Validaciones
        if (!codigo || !descripcion) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Código y Descripción son obligatorios' 
            });
        }

        // Verificar código único
        const existente = await productoRepo.findOneBy({ codigo });
        if (existente) {
            return reply.status(400).send({ 
                success: false, 
                error: 'El código ya existe' 
            });
        }

        const nuevoProducto = productoRepo.create({
            codigo,
            descripcion,
            stock_actual: stock_actual || 0,
            activo: true
        });

        await productoRepo.save(nuevoProducto);

        return reply.status(201).send({ 
            success: true, 
            data: nuevoProducto,
            message: 'Producto creado exitosamente' 
        });
    });

    // PUT /api/productos/:id - Actualizar producto
    fastify.put('/api/productos/:id', async (request, reply) => {
        const { id } = request.params;
        const { codigo, descripcion, activo } = request.body;

        const producto = await productoRepo.findOneBy({ id: Number(id) });
        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        // Validaciones
        if (!descripcion) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Descripción es obligatoria' 
            });
        }

        // Verificar código único si se cambió
        if (codigo && codigo !== producto.codigo) {
            const existente = await productoRepo.findOneBy({ codigo });
            if (existente) {
                return reply.status(400).send({ 
                    success: false, 
                    error: 'El código ya existe' 
                });
            }
            producto.codigo = codigo;
        }

        producto.descripcion = descripcion;
        if (activo !== undefined) producto.activo = activo;

        await productoRepo.save(producto);

        return { success: true, data: producto, message: 'Producto actualizado exitosamente' };
    });

    // DELETE /api/productos/:id - Eliminar (lógico)
    fastify.delete('/api/productos/:id', async (request, reply) => {
        const { id } = request.params;
        const producto = await productoRepo.findOneBy({ id: Number(id) });

        if (!producto) {
            return reply.status(404).send({ success: false, error: 'Producto no encontrado' });
        }

        producto.activo = false;
        await productoRepo.save(producto);

        return { success: true, message: 'Producto desactivado exitosamente' };
    });

    // POST /api/productos/importar - Importar desde Excel
    fastify.post('/api/productos/importar', async (request, reply) => {
        const data = await request.file();
        
        if (!data) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        const buffer = await data.toBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const productos = [];
        const errores = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const [codigo, descripcion, stock_actual] = row.values.slice(1);

            if (!codigo || !descripcion) {
                errores.push(`Fila ${rowNumber}: Código y Descripción son obligatorios`);
                return;
            }

            productos.push({
                codigo: String(codigo),
                descripcion: String(descripcion),
                stock_actual: stock_actual ? Number(stock_actual) : 0,
                activo: true
            });
        });

        if (errores.length > 0) {
            return reply.status(400).send({ success: false, errores });
        }

        let insertados = 0;
        let actualizados = 0;

        for (const productoData of productos) {
            const existente = await productoRepo.findOneBy({ codigo: productoData.codigo });
            if (!existente) {
                await productoRepo.save(productoRepo.create(productoData));
                insertados++;
            } else {
                existente.descripcion = productoData.descripcion;
                await productoRepo.save(existente);
                actualizados++;
            }
        }

        return { 
            success: true, 
            message: `Importación completada: ${insertados} insertados, ${actualizados} actualizados` 
        };
    });

    // GET /api/productos/exportar - Exportar a Excel
    fastify.get('/api/productos/exportar', async (request, reply) => {
        const { activo } = request.query;

        const queryBuilder = productoRepo.createQueryBuilder('producto');
        
        if (activo !== undefined) {
            queryBuilder.where('producto.activo = :activo', { activo: activo === 'true' });
        }

        const productos = await queryBuilder.orderBy('producto.descripcion', 'ASC').getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 50 },
            { header: 'Stock Actual', key: 'stock_actual', width: 15 },
            { header: 'Activo', key: 'activo', width: 10 }
        ];

        productos.forEach(producto => {
            worksheet.addRow({
                codigo: producto.codigo,
                descripcion: producto.descripcion,
                stock_actual: producto.stock_actual,
                activo: producto.activo ? 'Sí' : 'No'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=productos.xlsx');
        return reply.send(buffer);
    });
}

module.exports = productoRoutes;
