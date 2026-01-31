const bcrypt = require('bcrypt');

async function usuariosRoutes(fastify, options) {
    const usuarioRepo = fastify.db.getRepository('Usuario');
    const rolRepo = fastify.db.getRepository('Rol');
    const auditoriaRepo = fastify.db.getRepository('Auditoria');

    // Helper para registrar auditoría
    const registrarAuditoria = async (usuarioId, accion, tablaAfectada, registroId, valoresAnteriores, valoresNuevos) => {
        try {
            const auditoria = auditoriaRepo.create({
                usuario_id: usuarioId,
                accion,
                tabla_afectada: tablaAfectada,
                registro_id: registroId,
                valores_anteriores: valoresAnteriores,
                valores_nuevos: valoresNuevos
            });
            await auditoriaRepo.save(auditoria);
        } catch (error) {
            fastify.log.warn('Error al registrar auditoría:', error.message);
        }
    };

    // POST /api/usuarios/registro - Registro de nuevo usuario
    fastify.post('/api/usuarios/registro', async (request, reply) => {
        const { nombre, usuario, email, password, rol_id } = request.body;

        // Validaciones
        if (!nombre || !usuario || !email || !password || !rol_id) {
            return reply.status(400).send({
                success: false,
                error: 'Todos los campos son obligatorios'
            });
        }

        try {
            // Verificar usuario único
            const existente = await usuarioRepo.findOneBy({ usuario });
            if (existente) {
                return reply.status(400).send({
                    success: false,
                    error: 'El usuario ya existe'
                });
            }

            // Verificar rol
            const rol = await rolRepo.findOneBy({ id: Number(rol_id) });
            if (!rol) {
                return reply.status(404).send({
                    success: false,
                    error: 'Rol no encontrado'
                });
            }

            // Encriptar contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            // Crear usuario
            const nuevoUsuario = usuarioRepo.create({
                nombre,
                usuario,
                email,
                password: passwordHash,
                rol_id: Number(rol_id),
                activo: true
            });

            const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);

            // Registrar auditoría
            await registrarAuditoria(null, 'CREAR', 'usuarios', usuarioGuardado.id, null, {
                usuario: usuarioGuardado.usuario,
                email: usuarioGuardado.email,
                rol_id: usuarioGuardado.rol_id
            });

            return reply.status(201).send({
                success: true,
                data: {
                    id: usuarioGuardado.id,
                    nombre: usuarioGuardado.nombre,
                    usuario: usuarioGuardado.usuario,
                    email: usuarioGuardado.email,
                    rol_id: usuarioGuardado.rol_id
                },
                message: 'Usuario registrado exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // POST /api/usuarios/login - Iniciar sesión
    fastify.post('/api/usuarios/login', async (request, reply) => {
        const { usuario, password } = request.body;

        if (!usuario || !password) {
            return reply.status(400).send({
                success: false,
                error: 'Usuario y contraseña son obligatorios'
            });
        }

        try {
            const usuarioEncontrado = await usuarioRepo.findOne({
                where: { usuario },
                relations: ['rol']
            });

            if (!usuarioEncontrado || !usuarioEncontrado.activo) {
                return reply.status(401).send({
                    success: false,
                    error: 'Usuario o contraseña inválidos'
                });
            }

            // Verificar contraseña
            const passwordValida = await bcrypt.compare(password, usuarioEncontrado.password);
            if (!passwordValida) {
                return reply.status(401).send({
                    success: false,
                    error: 'Usuario o contraseña inválidos'
                });
            }

            // Actualizar último acceso
            usuarioEncontrado.ultimo_acceso = new Date();
            await usuarioRepo.save(usuarioEncontrado);

            // Registrar auditoría
            await registrarAuditoria(usuarioEncontrado.id, 'LOGIN', 'usuarios', usuarioEncontrado.id, null, null);

            // Generar JWT
            const token = fastify.jwt.sign({
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol_id: usuarioEncontrado.rol_id,
                permisos: usuarioEncontrado.rol?.permisos || {}
            });

            return {
                success: true,
                token,
                usuario: {
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.nombre,
                    usuario: usuarioEncontrado.usuario,
                    email: usuarioEncontrado.email,
                    rol: usuarioEncontrado.rol?.nombre
                }
            };

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // GET /api/usuarios - Listar usuarios
    fastify.get('/api/usuarios', async (request, reply) => {
        const { activo, rol_id, page = 1, limit = 50 } = request.query;

        const skip = (page - 1) * limit;
        const queryBuilder = usuarioRepo.createQueryBuilder('usuario');

        if (activo !== undefined) {
            queryBuilder.where('usuario.activo = :activo', { activo: activo === 'true' });
        }

        if (rol_id) {
            queryBuilder.andWhere('usuario.rol_id = :rol_id', { rol_id: Number(rol_id) });
        }

        queryBuilder
            .leftJoinAndSelect('usuario.rol', 'rol')
            .orderBy('usuario.nombre', 'ASC')
            .skip(skip)
            .take(limit);

        const [usuarios, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: usuarios.map(u => ({
                id: u.id,
                nombre: u.nombre,
                usuario: u.usuario,
                email: u.email,
                rol: u.rol?.nombre,
                activo: u.activo,
                ultimo_acceso: u.ultimo_acceso
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // GET /api/usuarios/:id - Obtener usuario
    fastify.get('/api/usuarios/:id', async (request, reply) => {
        const { id } = request.params;

        const usuario = await usuarioRepo.findOne({
            where: { id: Number(id) },
            relations: ['rol']
        });

        if (!usuario) {
            return reply.status(404).send({ success: false, error: 'Usuario no encontrado' });
        }

        return {
            success: true,
            data: {
                id: usuario.id,
                nombre: usuario.nombre,
                usuario: usuario.usuario,
                email: usuario.email,
                rol: usuario.rol?.nombre,
                activo: usuario.activo
            }
        };
    });

    // PUT /api/usuarios/:id - Actualizar usuario
    fastify.put('/api/usuarios/:id', async (request, reply) => {
        const { id } = request.params;
        const { nombre, email, activo } = request.body;

        const usuario = await usuarioRepo.findOneBy({ id: Number(id) });
        if (!usuario) {
            return reply.status(404).send({ success: false, error: 'Usuario no encontrado' });
        }

        const valoresAnteriores = {
            nombre: usuario.nombre,
            email: usuario.email,
            activo: usuario.activo
        };

        if (nombre) usuario.nombre = nombre;
        if (email) usuario.email = email;
        if (activo !== undefined) usuario.activo = activo;

        await usuarioRepo.save(usuario);

        await registrarAuditoria(null, 'ACTUALIZAR', 'usuarios', usuario.id, valoresAnteriores, {
            nombre: usuario.nombre,
            email: usuario.email,
            activo: usuario.activo
        });

        return {
            success: true,
            message: 'Usuario actualizado exitosamente'
        };
    });

    // POST /api/usuarios/:id/cambiar-password - Cambiar contraseña
    fastify.post('/api/usuarios/:id/cambiar-password', async (request, reply) => {
        const { id } = request.params;
        const { password_actual, password_nueva } = request.body;

        if (!password_actual || !password_nueva) {
            return reply.status(400).send({
                success: false,
                error: 'Contraseña actual y nueva son obligatorias'
            });
        }

        try {
            const usuario = await usuarioRepo.findOneBy({ id: Number(id) });
            if (!usuario) {
                return reply.status(404).send({ success: false, error: 'Usuario no encontrado' });
            }

            // Verificar contraseña actual
            const passwordValida = await bcrypt.compare(password_actual, usuario.password);
            if (!passwordValida) {
                return reply.status(401).send({
                    success: false,
                    error: 'Contraseña actual inválida'
                });
            }

            // Encriptar nueva contraseña
            usuario.password = await bcrypt.hash(password_nueva, 10);
            await usuarioRepo.save(usuario);

            await registrarAuditoria(usuario.id, 'CAMBIAR_PASSWORD', 'usuarios', usuario.id, null, null);

            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // DELETE /api/usuarios/:id - Desactivar usuario
    fastify.delete('/api/usuarios/:id', async (request, reply) => {
        const { id } = request.params;

        const usuario = await usuarioRepo.findOneBy({ id: Number(id) });
        if (!usuario) {
            return reply.status(404).send({ success: false, error: 'Usuario no encontrado' });
        }

        usuario.activo = false;
        await usuarioRepo.save(usuario);

        await registrarAuditoria(null, 'DESACTIVAR', 'usuarios', usuario.id, null, { activo: false });

        return {
            success: true,
            message: 'Usuario desactivado exitosamente'
        };
    });

    // GET /api/roles - Listar roles
    fastify.get('/api/roles', async (request, reply) => {
        const roles = await rolRepo.find({ where: { activo: true } });

        return {
            success: true,
            data: roles
        };
    });

    // POST /api/roles - Crear rol
    fastify.post('/api/roles', async (request, reply) => {
        const { nombre, descripcion, permisos } = request.body;

        if (!nombre) {
            return reply.status(400).send({
                success: false,
                error: 'Nombre del rol es obligatorio'
            });
        }

        try {
            const rol = rolRepo.create({
                nombre,
                descripcion,
                permisos: permisos || {},
                activo: true
            });

            const rolGuardado = await rolRepo.save(rol);

            return reply.status(201).send({
                success: true,
                data: rolGuardado,
                message: 'Rol creado exitosamente'
            });

        } catch (error) {
            return reply.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // GET /api/auditorias - Listar auditorías
    fastify.get('/api/auditorias', async (request, reply) => {
        const { usuario_id, tabla_afectada, fecha_desde, fecha_hasta, page = 1, limit = 100 } = request.query;

        const skip = (page - 1) * limit;
        const queryBuilder = auditoriaRepo.createQueryBuilder('auditoria');

        if (usuario_id) {
            queryBuilder.where('auditoria.usuario_id = :usuario_id', { usuario_id: Number(usuario_id) });
        }

        if (tabla_afectada) {
            queryBuilder.andWhere('auditoria.tabla_afectada = :tabla_afectada', { tabla_afectada });
        }

        if (fecha_desde) {
            queryBuilder.andWhere('auditoria.created_at >= :fecha_desde', { fecha_desde });
        }

        if (fecha_hasta) {
            queryBuilder.andWhere('auditoria.created_at <= :fecha_hasta', { fecha_hasta });
        }

        queryBuilder
            .orderBy('auditoria.created_at', 'DESC')
            .skip(skip)
            .take(limit);

        const [registros, total] = await queryBuilder.getManyAndCount();

        return {
            success: true,
            data: registros,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    });
}

module.exports = usuariosRoutes;
