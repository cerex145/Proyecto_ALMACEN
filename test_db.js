const AppDataSource = require('./apps/api/src/config/database');

async function test() {
    try {
        console.log('Connecting...');
        await AppDataSource.initialize();
        console.log('Connected!');
        await AppDataSource.destroy();
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
