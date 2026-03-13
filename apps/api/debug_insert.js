const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function test() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conectado a BD\n');
        
        // Revisar tabla productos
        const [tables] = await conn.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'productos' AND TABLE_SCHEMA = DATABASE()`
        );
        console.log('Columnas en tabla productos:');
        tables.forEach((t, i) => console.log(`  [${i}] ${t.COLUMN_NAME}`));
        
        // Intentar insertar un producto
        console.log('\n\nIntentando insertar producto...');
        try {
            const [r] = await conn.execute(
                `INSERT INTO productos (codigo, descripcion, proveedor, fabricante) 
                 VALUES (?, ?, ?, ?)`,
                ['TEST-001', 'Producto TEST', 'Proveedor TEST', 'Fabricante TEST']
            );
            console.log('✅ Inserción exitosa. ID:', r.insertId);
        } catch (e) {
            console.log('❌ Error:', e.message);
        }
        
    } finally {
        if (conn) await conn.end();
    }
}

test();
