const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const dbPlugin = require('./plugins/database.plugin');

async function buildApp(fastify, options) {
    await fastify.register(cors, {
        origin: true, // Allow all origins for development/Electron
        credentials: true
    });

    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this'
    });

    await fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    });

    await fastify.register(swagger, {
        openapi: {
            openapi: '3.0.3',
            info: {
                title: 'API Almacén - Sistema de Gestión de Inventario',
                description: 'API REST completa para la gestión de almacén, inventario, ingresos, salidas, lotes, alertas y reportes. Incluye autenticación JWT y control de acceso basado en roles.',
                version: '1.0.0',
                contact: {
                    name: 'Soporte API',
                    email: 'soporte@almacen.com'
                }
            },
            servers: [
                {
                    url: process.env.API_URL || 'http://localhost:3000',
                    description: process.env.API_URL ? 'Servidor de producción' : 'Servidor de desarrollo'
                }
            ],
            tags: [
                { name: 'Productos', description: 'Gestión de productos del almacén' },
                { name: 'Clientes', description: 'Gestión de clientes' },
                { name: 'Ingresos', description: 'Notas de ingreso de mercadería' },
                { name: 'Salidas', description: 'Notas de salida de mercadería' },
                { name: 'Lotes', description: 'Gestión de lotes y trazabilidad' },
                { name: 'Kardex', description: 'Movimientos de inventario (Kardex)' },
                { name: 'Reportes', description: 'Reportes de stock, ingresos y salidas' },
                { name: 'Alertas', description: 'Alertas de vencimiento de productos' },
                { name: 'Actas de Recepción', description: 'Actas de recepción de mercadería' },
                { name: 'Usuarios', description: 'Gestión de usuarios y autenticación' },
                { name: 'Roles', description: 'Gestión de roles y permisos' },
                { name: 'Auditoría', description: 'Registros de auditoría del sistema' },
                { name: 'Ajustes de Stock', description: 'Ajustes de inventario (positivos y negativos)' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Token JWT obtenido del endpoint /api/usuarios/login'
                    }
                },
                responses: {
                    UnauthorizedError: {
                        description: 'Token de acceso faltante o inválido',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: { type: 'string', example: 'No autorizado' }
                                    }
                                }
                            }
                        }
                    },
                    NotFoundError: {
                        description: 'Recurso no encontrado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: { type: 'string', example: 'Recurso no encontrado' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                { bearerAuth: [] }
            ]
        }
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    });

    await fastify.register(dbPlugin);

    // Ejecutar migraciones de columnas críticas al iniciar (idempotente)
    fastify.addHook('onReady', async () => {
        try {
            const qr = fastify.db.createQueryRunner();
            await qr.connect();

            const ensureCol = async (table, col, definition) => {
                const exists = await qr.hasColumn(table, col);
                if (!exists) {
                    await qr.addColumn(table, new (require('typeorm').TableColumn)({ name: col, ...definition }));
                    fastify.log.info(`✅ Columna añadida: ${table}.${col}`);
                }
            };

            await ensureCol('lotes', 'cantidad_ingresada', { type: 'decimal', precision: 10, scale: 2, isNullable: false, default: '0' });
            await ensureCol('lotes', 'cantidad_disponible', { type: 'decimal', precision: 10, scale: 2, isNullable: false, default: '0' });
            await ensureCol('lotes', 'nota_ingreso_id', { type: 'int', isNullable: true });
            await ensureCol('nota_salida_detalles', 'lote_id', { type: 'int', isNullable: true });
            await ensureCol('nota_salida_detalles', 'precio_unitario', { type: 'decimal', precision: 10, scale: 2, isNullable: true });
            await ensureCol('nota_salida_detalles', 'lote_numero', { type: 'varchar', length: '100', isNullable: true });
            await ensureCol('nota_salida_detalles', 'fecha_vencimiento', { type: 'date', isNullable: true });
            await ensureCol('nota_salida_detalles', 'um', { type: 'varchar', length: '50', isNullable: true });
            await ensureCol('nota_salida_detalles', 'fabricante', { type: 'varchar', length: '200', isNullable: true });
            await ensureCol('nota_salida_detalles', 'cant_bulto', { type: 'decimal', precision: 10, scale: 2, isNullable: true, default: '0' });
            await ensureCol('nota_salida_detalles', 'cant_caja', { type: 'decimal', precision: 10, scale: 2, isNullable: true, default: '0' });
            await ensureCol('nota_salida_detalles', 'cant_x_caja', { type: 'decimal', precision: 10, scale: 2, isNullable: true, default: '0' });
            await ensureCol('nota_salida_detalles', 'cant_fraccion', { type: 'decimal', precision: 10, scale: 2, isNullable: true, default: '0' });
            await ensureCol('nota_salida_detalles', 'cantidad_total', { type: 'decimal', precision: 10, scale: 2, isNullable: true, default: '0' });
            await ensureCol('notas_ingreso', 'numero_guia', { type: 'int', isNullable: true });


            // Reparar cantidad_total = cantidad para detalles de ingreso sin total
            await qr.query(`
                UPDATE nota_ingreso_detalles
                SET cantidad_total = cantidad
                WHERE (cantidad_total IS NULL OR cantidad_total = 0) AND cantidad > 0
            `);

            await qr.release();
            fastify.log.info('✅ Migraciones de arranque completadas');
        } catch (err) {
            fastify.log.warn('⚠️ Migraciones de arranque (no crítico):', err.message);
        }
    });

    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    // Register routes
    await fastify.register(require('./routes/clientes.routes'));
    await fastify.register(require('./routes/productos.routes'));
    await fastify.register(require('./routes/ajustes.routes'));
    await fastify.register(require('./routes/ingresos.routes'));
    await fastify.register(require('./routes/actas-recepcion.routes'));
    await fastify.register(require('./routes/salidas.routes'));
    await fastify.register(require('./routes/kardex.routes'));
    await fastify.register(require('./routes/lotes.routes'));
    await fastify.register(require('./routes/alertas.routes'));

    await fastify.register(require('./routes/usuarios.routes'));

    fastify.route({
        method: ['GET', 'HEAD'],
        url: '/',
        handler: async () => ({ status: 'ok' })
    });

    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date() };
    });

    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(error);
        reply.status(error.statusCode || 500).send({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    });
}

module.exports = buildApp;
