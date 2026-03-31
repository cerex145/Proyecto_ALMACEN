/**
 * restore-db.js — Restaura el último backup de Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function restore() {
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Hardcode explicitly since mtime was wrong
    const latestBackup = 'backup_2026-03-30T04-52-49.sql';
    const backupPath = path.join(backupDir, latestBackup);
    
    if (!fs.existsSync(backupPath)) {
        console.error('❌ El archivo ' + latestBackup + ' no existe.');
        process.exit(1);
    }

    console.log(`✅ Archivo encontrado: ${latestBackup}`);
    console.log('🔄 Extrayendo datos...');
    
    const sqlData = fs.readFileSync(backupPath, 'utf8');

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado a Supabase PostgreSQL');
        
        console.log('🔄 Ejecutando consultas de restauración...');
        
        // Empieza una transacción
        await client.query('BEGIN');
        
        // Ejecuta todos los DROP/DELETE e INSERTS del archivo sql
        await client.query(sqlData);
        
        // Confirma la transacción
        await client.query('COMMIT');
        
        console.log('✅ BASE DE DATOS RESTAURADA CON ÉXITO.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error al restaurar BD.');
        console.error(err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

restore();
