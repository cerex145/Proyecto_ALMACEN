require('dotenv').config();

const fastify = require('fastify')({
    logger: {
        level: 'info',
    }
});

const buildApp = require('./app');

console.log('🟢 server.js START'); // DB sync disabled

const start = async () => {
    try {
        console.log('1️⃣ antes de buildApp');
        await buildApp(fastify);
        console.log('2️⃣ después de buildApp');

        console.log('3️⃣ antes de listen');
        await fastify.listen({ port: 3000, host: '127.0.0.1' });
        console.log('🚀 Fastify server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
