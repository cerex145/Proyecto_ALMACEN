const fp = require('fastify-plugin');
const AppDataSource = require('../config/database');

async function dbConnector(fastify, options) {
    try {
        await AppDataSource.initialize();
        fastify.log.info('✅ MySQL Database connected');

        fastify.decorate('db', AppDataSource);

        fastify.addHook('onClose', async (instance) => {
            await AppDataSource.destroy();
            fastify.log.info('Database connection closed');
        });
    } catch (error) {
        fastify.log.error('❌ Database connection error:', error);
        throw error;
    }
}

module.exports = fp(dbConnector);