const mysql = require('mysql2/promise');

console.log('Intentando conexión...\n');

mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'root123',
    database: 'almacen_db'
}).then(conn => {
    console.log('✅ Conexión exitosa\n');
    conn.end().then(() => process.exit(0));
}).catch(err => {
    console.log('❌ Error:', err.message);
    console.log('Código:', err.code);
    process.exit(1);
});
