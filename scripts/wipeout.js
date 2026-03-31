/**
 * wipeout.js — Base de Datos regresará al estatus inicial "Día Cero"
 * TODO SE BORRA excepto Clientes, Usuarios y Roles.
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function wipeout() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('🧨 PREPARANDO DETONADOR DE LIMPIEZA TOTAL...');
        
        // Empieza una transacción por precaución
        await client.query('BEGIN');

        // Obtener solo las tablas que existen y que no sean las protegidas
        const { rows } = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE'
              AND table_name NOT IN ('clientes', 'roles', 'usuarios')
        `);
        
        if (rows.length === 0) {
            console.log('No hay tablas operativas que truncar.');
        } else {
            const tablesToTruncate = rows.map(r => '"' + r.table_name + '"').join(', ');
            const truncateQuery = `TRUNCATE TABLE ${tablesToTruncate} RESTART IDENTITY CASCADE;`;
            
            console.log('🔄 Ejecutando borrado masivo dinámico (TRUNCATE CASCADE)...');
            await client.query(truncateQuery);
        }
        
        await client.query('COMMIT');
        
        console.log('✅ BOMBA EJECUTADA. LA BASE DE DATOS HA VUELTO AL DÍA CERO.');
        console.log('   (Clientes, Roles y Usuarios se encuentran intactos y a salvo).');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ FATAL ERROR. NO SE PUDO LIMPIAR LA BASE DE DATOS.');
        console.error(err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

wipeout();
