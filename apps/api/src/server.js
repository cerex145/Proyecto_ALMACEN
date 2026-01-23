const fastify = require('fastify')({
    logger: {
        level: 'info',
        prettyPrint: process.env.NODE_ENV === 'development'
    }
});

const buildApp = require('./app');

const start = async () => {
    try {
        await buildApp(fastify);

        await fastify.listen({
            port: 3000,
            host: '127.0.0.1'
        });

        console.log('🚀 Fastify server running on http://localhost:3000');
        console.log('📊 Health check: http://localhost:3000/health');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Manejar cierre graceful
process.on('SIGINT', async () => {
    await fastify.close();
    process.exit(0);
});

start();