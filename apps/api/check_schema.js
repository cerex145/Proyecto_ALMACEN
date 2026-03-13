const mysql = require('mysql2/promise');

async function test() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root123',
            database: 'almacen_db'
        });
        
        // Listar tablas
        const [tables] = await conn.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
        );
        console.log('Tablas en BD:');
        tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
        
        // Revisa columnas de productos
        const [cols] = await conn.execute(
            `DESCRIBE productos`
        );
        console.log('\nColumnas en tabla productos:');
        cols.forEach(c => console.log(`  - ${c.Field}`));
        
    } finally {
        if (conn) await conn.end();
    }
}

test();
