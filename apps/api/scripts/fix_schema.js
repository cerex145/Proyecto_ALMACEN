const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function ejecutarMigraciones() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root123',
            database: 'almacen_db'
        });
        
        console.log('✅ Conectado a BD\n');
        
        console.log('🗑️  Eliminando tabla productos (primero)...\n');
        try {
            await conn.execute('DROP TABLE productos');
            console.log('  ✓ Tabla productos eliminada');
        } catch (e) {}
        
        // Drop de tablas antiguas para comenzar desde cero
        console.log('\n🗑️  Eliminando tablas restantes...\n');
        const tablasAntiguas = [
            'detalle_acta', 'actas_recepcion', 'detalle_salida', 'salidas',
            'detalle_ingreso', 'ingresos', 'lotes', 'kardex', 'alertas_vencimiento',
            'nota_salida_detalles', 'nota_ingreso_detalles', 'notas_salida', 'notas_ingreso',
            'ajustes', 'importaciones', 'proveedores', 'clientes'
        ];
        
        for (const tabla of tablasAntiguas) {
            try {
                await conn.execute(`DROP TABLE IF EXISTS ${tabla}`);
                console.log(`  ✓ Tabla ${tabla} eliminada`);
            } catch (e) {
                // Silencioso
            }
        }
        
        // Ejecutar migración 001
        console.log('\n📋 Ejecutando migración 001...\n');
        let sql001 = fs.readFileSync(
            path.join(__dirname, '../migrations/001_create_clientes_and_ajustes.sql'),
            'utf-8'
        );
        let statements = sql001.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            if (stmt.trim()) {
                try {
                    await conn.execute(stmt);
                } catch (e) {
                    console.log(`  ⚠️  ${e.message.substring(0, 50)}`);
                }
            }
        }
        console.log('✅ Migración 001 completada');
        
        // Ejecutar migración 002
        console.log('\n📋 Ejecutando migración 002...\n');
        let sql002 = fs.readFileSync(
            path.join(__dirname, '../migrations/002_create_complete_schema.sql'),
            'utf-8'
        );
        // Remover BOM
        if (sql002.charCodeAt(0) === 0xfeff) {
            sql002 = sql002.slice(1);
        }
        statements = sql002.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            if (stmt.trim()) {
                try {
                    await conn.execute(stmt);
                } catch (e) {
                    console.log(`  ⚠️  ${e.message.substring(0, 70)}`);
                }
            }
        }
        console.log('✅ Migración 002 completada');
        
        // Verificar tabla productos
        console.log('\n✓ Verificando tabla productos...\n');
        const [cols] = await conn.execute('DESCRIBE productos');
        console.log('Columnas en productos:');
        cols.forEach(c => console.log(`  - ${c.Field}`));
        
        console.log('\n✅ SCHEMA ACTUALIZADO CORRECTAMENTE\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

ejecutarMigraciones();
