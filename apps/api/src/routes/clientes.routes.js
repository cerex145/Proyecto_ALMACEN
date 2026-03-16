const ExcelJS = require('exceljs');

const ClienteSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        codigo: { type: 'string' },
        razon_social: { type: 'string' },
        cuit: { type: 'string', nullable: true },
        direccion: { type: 'string', nullable: true },
        distrito: { type: 'string', nullable: true },
        provincia: { type: 'string', nullable: true },
        departamento: { type: 'string', nullable: true },
        categoria_riesgo: { type: 'string', nullable: true },
        estado: { type: 'string', nullable: true },
        telefono: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true },
        activo: { type: 'integer' },
        created_at: { type: 'string', nullable: true },
        updated_at: { type: 'string', nullable: true }
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
        error: { type: 'string' },
        errores: { type: 'array', items: { type: 'string' } }
    }
};

const ClienteListResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: { type: 'array', items: ClienteSchema },
        pagination: PaginationSchema
    }
};

const ClienteResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: ClienteSchema
    }
};

const ClienteResponseWithMessageSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        data: ClienteSchema,
        message: { type: 'string' }
    }
};

async function clienteRoutes(fastify, options) {
    const clienteRepo = fastify.db.getRepository('Cliente');
    const toActivoSmallint = (value) => (value === true || value === 'true' || value === 1 || value === '1' ? 1 : 0);

    // GET /api/clientes - Listar con filtros y paginación
    fastify.get('/api/clientes', {
        schema: {
            tags: ['Clientes'],
            description: 'Listar clientes con filtros y paginación',
            querystring: {
                type: 'object',
                properties: {
                    busqueda: { type: 'string' },
                    activo: { type: 'string', enum: ['true', 'false'] },
                    page: { type: 'integer', minimum: 1 },
                    limit: { type: 'integer', minimum: 1 },
                    orderBy: { type: 'string' },
                    order: { type: 'string', enum: ['ASC', 'DESC', 'asc', 'desc'] }
                }
            },
            response: {
                200: ClienteListResponseSchema
            }
        }
    }, async (request, reply) => {
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
                '(cliente.codigo LIKE :busqueda OR cliente.razon_social LIKE :busqueda)',
                { busqueda: `%${busqueda}%` }
            );
        }

        if (activo !== undefined) {
            queryBuilder.andWhere('cliente.activo = :activo', { activo: toActivoSmallint(activo) });
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
    fastify.get('/api/clientes/:id', {
        schema: {
            tags: ['Clientes'],
            description: 'Obtener un cliente por ID',
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ClienteResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const cliente = await clienteRepo.findOneBy({ id: Number(id) });

        if (!cliente) {
            return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
        }

        return { success: true, data: cliente };
    });

    // POST /api/clientes - Crear cliente
    fastify.post('/api/clientes', {
        schema: {
            tags: ['Clientes'],
            description: 'Crear un nuevo cliente',
            body: {
                type: 'object',
                required: ['codigo', 'razon_social', 'cuit'],
                properties: {
                    codigo: { type: 'string' },
                    razon_social: { type: 'string' },
                    cuit: { type: 'string' },
                    direccion: { type: 'string' },
                    distrito: { type: 'string' },
                    provincia: { type: 'string' },
                    departamento: { type: 'string' },
                    categoria_riesgo: { type: 'string', enum: ['Bajo', 'Alto', 'No verificado'] },
                    estado: { type: 'string', enum: ['Activo', 'Inactivo', 'Potencial', 'Blokeado'] },
                    telefono: { type: 'string' },
                    email: { type: 'string' }
                }
            },
            response: {
                201: ClienteResponseWithMessageSchema,
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { codigo, razon_social, cuit, direccion, distrito, provincia, departamento, categoria_riesgo, estado, telefono, email } = request.body;

        // Validaciones
        if (!codigo || !razon_social || !cuit) {
            return reply.status(400).send({
                success: false,
                error: 'Código, Razón Social y CUIT/RUC son obligatorios'
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
            cuit,
            direccion: direccion || null,
            distrito: distrito || null,
            provincia: provincia || null,
            departamento: departamento || null,
            categoria_riesgo: categoria_riesgo || null,
            estado: estado || 'Activo',
            telefono: telefono || null,
            email: email || null,
            activo: 1
        });

        await clienteRepo.save(nuevoCliente);

        return reply.status(201).send({
            success: true,
            data: nuevoCliente,
            message: 'Cliente creado exitosamente'
        });
    });

    // PUT /api/clientes/:id - Actualizar cliente
    fastify.put('/api/clientes/:id', {
        schema: {
            tags: ['Clientes'],
            description: 'Actualizar un cliente existente',
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
                    codigo: { type: 'string' },
                    razon_social: { type: 'string' },
                    cuit: { type: 'string' },
                    direccion: { type: 'string' },
                    distrito: { type: 'string' },
                    provincia: { type: 'string' },
                    departamento: { type: 'string' },
                    categoria_riesgo: { type: 'string', enum: ['Bajo', 'Alto', 'No verificado'] },
                    estado: { type: 'string', enum: ['Activo', 'Inactivo', 'Potencial', 'Blokeado'] },
                    telefono: { type: 'string' },
                    email: { type: 'string' },
                    activo: { type: 'boolean' }
                }
            },
            response: {
                200: ClienteResponseWithMessageSchema,
                400: ErrorResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { codigo, razon_social, cuit, direccion, distrito, provincia, departamento, categoria_riesgo, estado, telefono, email, activo } = request.body;

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
        if (cuit !== undefined) cliente.cuit = cuit;
        cliente.direccion = direccion || null;
        if (distrito !== undefined) cliente.distrito = distrito || null;
        if (provincia !== undefined) cliente.provincia = provincia || null;
        if (departamento !== undefined) cliente.departamento = departamento || null;
        if (categoria_riesgo !== undefined) cliente.categoria_riesgo = categoria_riesgo || null;
        if (estado !== undefined) cliente.estado = estado;
        cliente.telefono = telefono || null;
        cliente.email = email || null;
        if (activo !== undefined) cliente.activo = toActivoSmallint(activo);

        await clienteRepo.save(cliente);

        return { success: true, data: cliente, message: 'Cliente actualizado exitosamente' };
    });

    // DELETE /api/clientes/:id - Eliminar (lógico)
    fastify.delete('/api/clientes/:id', {
        schema: {
            tags: ['Clientes'],
            description: 'Desactivar un cliente (eliminación lógica)',
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
        const cliente = await clienteRepo.findOneBy({ id: Number(id) });

        if (!cliente) {
            return reply.status(404).send({ success: false, error: 'Cliente no encontrado' });
        }

        cliente.activo = 0;
        await clienteRepo.save(cliente);

        return { success: true, message: 'Cliente desactivado exitosamente' };
    });

    // POST /api/clientes/importar - Importar desde Excel
    fastify.post('/api/clientes/importar', {
        schema: {
            tags: ['Clientes'],
            description: 'Importar clientes desde archivo Excel',
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                required: ['file'],
                properties: {
                    file: { type: 'string', format: 'binary' }
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
                400: ErrorResponseSchema
            }
        }
    }, async (request, reply) => {
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

            if (!codigo || !razon_social || !cuit) {
                errores.push(`Fila ${rowNumber}: Código, Razón Social y CUIT/RUC son obligatorios`);
                return;
            }

            clientes.push({
                codigo: String(codigo),
                razon_social: String(razon_social),
                cuit: String(cuit),
                direccion: direccion ? String(direccion) : null,
                telefono: telefono ? String(telefono) : null,
                email: email ? String(email) : null,
                activo: 1
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
    fastify.get('/api/clientes/exportar', {
        schema: {
            tags: ['Clientes'],
            description: 'Exportar clientes a archivo Excel',
            querystring: {
                type: 'object',
                properties: {
                    activo: { type: 'string', enum: ['true', 'false'] }
                }
            },
            response: {
                200: { type: 'string', format: 'binary' }
            }
        }
    }, async (request, reply) => {
        const { activo } = request.query;

        const queryBuilder = clienteRepo.createQueryBuilder('cliente');

        if (activo !== undefined) {
            queryBuilder.where('cliente.activo = :activo', { activo: toActivoSmallint(activo) });
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
