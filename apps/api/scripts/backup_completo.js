/**
 * Script para hacer backup completo de la base de datos
 * Genera un archivo SQL que puedes ejecutar en otra PC
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const BACKUP_DIR = path.join(__dirname, '../../backups');

async function backupDatabase() {
    console.log('\n' + '═'.repeat(80));
    console.log('💾 CREANDO BACKUP COMPLETO DE BASE DE DATOS');
    console.log('═'.repeat(80) + '\n');

    let conn;
    let backupContent = '';

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conectado a base de datos\n');

        // Header del backup
        backupContent += `-- ========================================\n`;
        backupContent += `-- BACKUP COMPLETO: almacen_db\n`;
        backupContent += `-- Fecha: ${new Date().toISOString()}\n`;
        backupContent += `-- ========================================\n\n`;
        backupContent += `DROP DATABASE IF EXISTS almacen_db;\n`;
        backupContent += `CREATE DATABASE almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
        backupContent += `USE almacen_db;\n\n`;

        // Obtener todas las tablas (excluyendo vistas)
        const [tables] = await conn.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
            [process.env.DB_NAME]
        );

        console.log(`📋 ${tables.length} tablas encontradas\n`);

        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`  ⏳ Procesando tabla: ${tableName}...`);

            try {
                // Obtener CREATE TABLE
                const [createResult] = await conn.execute(
                    `SHOW CREATE TABLE ${tableName}`
                );
                backupContent += `\n-- ========== TABLA: ${tableName} ==========\n`;
                backupContent += `DROP TABLE IF EXISTS ${tableName};\n`;
                backupContent += createResult[0]['Create Table'] + ';\n\n';

                // Obtener datos
                const [rows] = await conn.execute(`SELECT * FROM ${tableName}`);

                if (rows.length > 0) {
                    backupContent += `-- Datos para ${tableName}\n`;
                    for (const row of rows) {
                        const columns = Object.keys(row).join(', ');
                        const values = Object.values(row)
                            .map(v => {
                                if (v === null) return 'NULL';
                                if (typeof v === 'string') {
                                    return `'${v.replace(/'/g, "''")}'`;
                                }
                                if (Buffer.isBuffer(v)) {
                                    return `0x${v.toString('hex')}`;
                                }
                                return v;
                            })
                            .join(', ');
                        backupContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
                    }
                    backupContent += `\n`;
                }
            } catch (error) {
                console.log(`     ⚠️  Error procesando ${tableName}: ${error.message}`);
            }
        }

        // Guardar archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().getTime();
        const backupFile = path.join(BACKUP_DIR, `almacen_backup_completo_${timestamp}.sql`);

        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        fs.writeFileSync(backupFile, backupContent, 'utf8');
        const fileSizeKB = (fs.statSync(backupFile).size / 1024).toFixed(2);

        console.log(`\n✅ BACKUP CREADO EXITOSAMENTE`);
        console.log(`📁 Archivo: ${backupFile}`);
        console.log(`📊 Tamaño: ${fileSizeKB} KB\n`);

        // Listar archivos
        console.log('📂 Backups disponibles:');
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort()
            .reverse()
            .slice(0, 5);

        backups.forEach((f, i) => {
            const stats = fs.statSync(path.join(BACKUP_DIR, f));
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ${i + 1}. ${f} (${sizeKB} KB)`);
        });

        console.log('\n' + '═'.repeat(80));
        console.log('💡 Para restaurar en otra PC:');
        console.log('   1. Copia el archivo .sql a la otra PC');
        console.log('   2. Abre MySQL y ejecuta: source /ruta/al/archivo.sql');
        console.log('═'.repeat(80) + '\n');

        conn.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (conn) conn.end();
        process.exit(1);
    }
}

backupDatabase();
