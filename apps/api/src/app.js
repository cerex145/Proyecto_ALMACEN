const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const dbPlugin = require('./plugins/database.plugin');

async function buildApp(fastify, options) {
    // Registrar CORS
    await fastify.register(cors, {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true
    });

    // Registrar JWT
    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this'
    });

    // Registrar Multipart (para archivos Excel)
    await fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB
        }
    });

    // Conectar a la base de datos
    await fastify.register(dbPlugin);

    // Middleware de autenticación
    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    // Health check
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date() };
    });

    // TODO: Registrar rutas
    // await fastify.register(require('./routes'), { prefix: '/api' });

    // Error handler
    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(error);
        reply.status(error.statusCode || 500).send({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    });

    return fastify;
}

module.exports = buildApp;