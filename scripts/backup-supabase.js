#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupPath = path.join(__dirname, '..', 'backups', `supabase_backup_${timestamp}.sql`);

async function backupDatabase() {
    const client = new Client({ connectionString: DATABASE_URL });
    
    try {
        console.log('🔄 Conectando a Supabase...');
        await client.connect();
        console.log('✅ Conexión establecida');
        
        // Obtener lista de tablas
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const tables = tablesResult.rows.map(r => r.table_name);
        console.log(`📊 Encontradas ${tables.length} tablas:`);
        tables.forEach(t => console.log(`   - ${t}`));
        
        // Crear backup en SQL
        console.log(`\n💾 Creando backup...`);
        let sqlContent = `-- Backup de Supabase - ${new Date().toISOString()}\n\n`;
        
        for (const table of tables) {
            console.log(`  → Exportando ${table}...`);
            
            // Obtener schema de la tabla
            const schemaResult = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            
            // Crear tabla
            const columns = schemaResult.rows.map(col => {
                let def = `${col.column_name} ${col.data_type}`;
                if (col.column_default) def += ` DEFAULT ${col.column_default}`;
                if (col.is_nullable === 'NO') def += ` NOT NULL`;
                return def;
            }).join(',\n    ');
            
            sqlContent += `CREATE TABLE IF NOT EXISTS ${table} (\n    ${columns}\n);\n\n`;
            
            // Obtener datos
            const dataResult = await client.query(`SELECT * FROM ${table}`);
            
            if (dataResult.rows.length > 0) {
                const columnNames = Object.keys(dataResult.rows[0]);
                const values = dataResult.rows.map(row => {
                    const vals = columnNames.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (typeof val === 'boolean') return val ? 'true' : 'false';
                        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                        return String(val);
                    });
                    return `(${vals.join(', ')})`;
                }).join(',\n');
                
                sqlContent += `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES\n${values};\n\n`;
            }
        }
        
        // Guardar archivo
        fs.writeFileSync(backupPath, sqlContent);
        const fileSize = (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2);
        
        console.log(`\n✅ Backup completado exitosamente`);
        console.log(`📊 Tamaño: ${fileSize} MB`);
        console.log(`📍 Guardado en: ${backupPath}`);
        
    } catch (error) {
        console.error('❌ Error durante backup:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

backupDatabase();
