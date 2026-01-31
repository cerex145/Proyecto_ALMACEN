const ExcelJS = require('exceljs');

async function clienteRoutes(fastify, options) {
    const clienteRepo = fastify.db.getRepository('Cliente');

    // GET /api/clientes - Listar con filtros y paginación
    fastify.get('/api/clientes', async (request, reply) => {
        const { 
            busqueda = '', 
            activo, 
            page = 1, 
            limit = 50,
            orderBy = 'razon_social',
            order = 'ASC'
        } = request.query;

        const skip = (page - 1) * limit;

        const queryBuilder = clienteRepo.createQueryBuilder('cliente');

        if (busqueda) {
            queryBuilder.where(
                '(cliente.codigo LIKE :busqueda OR cliente.razon_social LIKE :busqueda OR cliente.cuit LIKE :busqueda)',
                { busqueda: `%${busqueda}%` }
            );
        }

        if (activo !== undefined) {
            queryBuilder.andWhere('cliente.activo = :activo', { activo: activo === 'true' });
        }

        queryBuilder
            .orderBy(`cliente.${orderBy}`, order.toUpperCase())
            .skip(skip)
            .take(limit);

        const [clientes, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: clientes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/clientes/:id - Obtener un cliente
    fastify.get('/api/clientes/:id', async (request, reply) => {
        const { id } = request.params;
        const cliente = await clienteRepo.findOneBy({ id: Number(id) });

        if (!cliente) {
            return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
        }

        return { success: true, data: cliente };
    });

    // POST /api/clientes - Crear cliente
    fastify.post('/api/clientes', async (request, reply) => {
        const { codigo, razon_social, cuit, direccion, telefono, email } = request.body;

        // Validaciones
        if (!codigo || !razon_social) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Código y Razón Social son obligatorios' 
            });
        }

        // Verificar código único
        const existente = await clienteRepo.findOneBy({ codigo });
        if (existente) {
            return reply.status(400).send({ 
                success: false, 
                error: 'El código ya existe' 
            });
        }

        const nuevoCliente = clienteRepo.create({
            codigo,
            razon_social,
            cuit: cuit || null,
            direccion: direccion || null,
            telefono: telefono || null,
            email: email || null,
            activo: true
        });

        await clienteRepo.save(nuevoCliente);

        return reply.status(201).send({ 
            success: true, 
            data: nuevoCliente,
            message: 'Cliente creado exitosamente' 
        });
    });

    // PUT /api/clientes/:id - Actualizar cliente
    fastify.put('/api/clientes/:id', async (request, reply) => {
        const { id } = request.params;
        const { codigo, razon_social, cuit, direccion, telefono, email, activo } = request.body;

        const cliente = await clienteRepo.findOneBy({ id: Number(id) });
        if (!cliente) {
            return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
        }

        // Validaciones
        if (!razon_social) {
            return reply.status(400).send({ 
                success: false, 
                error: 'Razón Social es obligatoria' 
            });
        }

        // Verificar código único si se cambió
        if (codigo && codigo !== cliente.codigo) {
            const existente = await clienteRepo.findOneBy({ codigo });
            if (existente) {
                return reply.status(400).send({ 
                    success: false, 
                    error: 'El código ya existe' 
                });
            }
            cliente.codigo = codigo;
        }

        cliente.razon_social = razon_social;
        cliente.cuit = cuit || null;
        cliente.direccion = direccion || null;
        cliente.telefono = telefono || null;
        cliente.email = email || null;
        if (activo !== undefined) cliente.activo = activo;

        await clienteRepo.save(cliente);

        return { success: true, data: cliente, message: 'Cliente actualizado exitosamente' };
    });

    // DELETE /api/clientes/:id - Eliminar (lógico)
    fastify.delete('/api/clientes/:id', async (request, reply) => {
        const { id } = request.params;
        const cliente = await clienteRepo.findOneBy({ id: Number(id) });

        if (!cliente) {
            return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
        }

        cliente.activo = false;
        await clienteRepo.save(cliente);

        return { success: true, message: 'Cliente desactivado exitosamente' };
    });

    // POST /api/clientes/importar - Importar desde Excel
    fastify.post('/api/clientes/importar', async (request, reply) => {
        const data = await request.file();
        
        if (!data) {
            return reply.status(400).send({ success: false, error: 'No se recibió archivo' });
        }

        const buffer = await data.toBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const clientes = [];
        const errores = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const [codigo, razon_social, cuit, direccion, telefono, email] = row.values.slice(1);

            if (!codigo || !razon_social) {
                errores.push(`Fila ${rowNumber}: Código y Razón Social son obligatorios`);
                return;
            }

            clientes.push({
                codigo: String(codigo),
                razon_social: String(razon_social),
                cuit: cuit ? String(cuit) : null,
                direccion: direccion ? String(direccion) : null,
                telefono: telefono ? String(telefono) : null,
                email: email ? String(email) : null,
                activo: true
            });
        });

        if (errores.length > 0) {
            return reply.status(400).send({ success: false, errores });
        }

        let insertados = 0;
        let omitidos = 0;

        for (const clienteData of clientes) {
            const existente = await clienteRepo.findOneBy({ codigo: clienteData.codigo });
            if (!existente) {
                await clienteRepo.save(clienteRepo.create(clienteData));
                insertados++;
            } else {
                omitidos++;
            }
        }

        return { 
            success: true, 
            message: `Importación completada: ${insertados} insertados, ${omitidos} omitidos` 
        };
    });

    // GET /api/clientes/exportar - Exportar a Excel
    fastify.get('/api/clientes/exportar', async (request, reply) => {
        const { activo } = request.query;

        const queryBuilder = clienteRepo.createQueryBuilder('cliente');
        
        if (activo !== undefined) {
            queryBuilder.where('cliente.activo = :activo', { activo: activo === 'true' });
        }

        const clientes = await queryBuilder.orderBy('cliente.razon_social', 'ASC').getMany();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes');

        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Razón Social', key: 'razon_social', width: 40 },
            { header: 'CUIT', key: 'cuit', width: 15 },
            { header: 'Dirección', key: 'direccion', width: 40 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Activo', key: 'activo', width: 10 }
        ];

        clientes.forEach(cliente => {
            worksheet.addRow({
                codigo: cliente.codigo,
                razon_social: cliente.razon_social,
                cuit: cliente.cuit,
                direccion: cliente.direccion,
                telefono: cliente.telefono,
                email: cliente.email,
                activo: cliente.activo ? 'Sí' : 'No'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', 'attachment; filename=clientes.xlsx');
        return reply.send(buffer);
    });
}

module.exports = clienteRoutes;
