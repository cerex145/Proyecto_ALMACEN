/**
 * DEBUG - Verificar estructura BD y parse de CSV
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mysql = require('mysql2/promise');

async function verificar() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('\n📊 VERIFICACIÓN DE ESTRUCTURA BD...\n');
        
        // Verificar tablas
        const [tables] = await conn.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
        );
        
        console.log('📋 Tablas en la BD:');
        tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
        
        // Verificar nota_ingreso
        try {
            const [cols] = await conn.execute(`DESCRIBE nota_ingreso`);
            console.log('\n📝 Columnas en nota_ingreso:');
            cols.forEach(c => console.log(`   - ${c.Field} (${c.Type})`));
        } catch (e) {
            console.log('\n❌ Tabla nota_ingreso no existe');
        }
        
        // Verificar nota_ingreso_detalles
        try {
            const [cols] = await conn.execute(`DESCRIBE nota_ingreso_detalles`);
            console.log('\n📝 Columnas en nota_ingreso_detalles:');
            cols.forEach(c => console.log(`   - ${c.Field} (${c.Type})`));
        } catch (e) {
            console.log('\n❌ Tabla nota_ingreso_detalles no existe');
        }
        
        console.log('\n═'.repeat(70));
        console.log('📄 PARSE DE CSV\n');
        
        const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
        const lineas = ingContent.split('\n').slice(0, 3);
        
        console.log('Headers:');
        const headers = lineas[0].split(';');
        headers.forEach((h, i) => console.log(`   [${i}] ${h}`));
        
        console.log('\nPrimer registro:');
        const valores = lineas[1].split(';');
        valores.forEach((v, i) => console.log(`   [${i}] "${v}"`));
        
        console.log('\nValores parseados:');
        console.log(`   codProd [1]: "${valores[1] || ''}"`);
        console.log(`   producto [2]: "${valores[2] || ''}"`);
        console.log(`   lote [3]: "${valores[3] || ''}"`);
        console.log(`   cantidad [12]: "${valores[12] || ''}"`);
        console.log(`   fechaStr [13]: "${valores[13] || ''}"`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
    } finally {
        if (conn) await conn.end();
    }
}

verificar();
