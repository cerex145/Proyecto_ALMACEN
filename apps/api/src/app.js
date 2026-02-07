const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const dbPlugin = require('./plugins/database.plugin');

async function buildApp(fastify, options) {
    await fastify.register(cors, {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
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
                title: 'API Almacén',
                description: 'Documentación Swagger de la API REST',
                version: '1.0.0'
            },
            servers: [
                { url: 'http://localhost:3000' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
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
    await fastify.register(require('./routes/reportes.routes'));
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
