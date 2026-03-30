/**
 * backup-db.js — Genera un backup SQL completo de la base de datos Supabase
 * Uso: node scripts/backup-db.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

// Tablas a exportar (en orden para respetar FK)
const TABLAS = [
    'roles',
    'usuarios',
    'clientes',
    'productos',
    'lotes',
    'notas_ingreso',
    'nota_ingreso_detalles',
    'notas_salida',
    'nota_salida_detalles',
    'kardex',
    'ajustes_stock',
    'alertas_vencimiento',
    'actas_recepcion',
    'acta_recepcion_detalles',
    'auditoria'
];

function escapeVal(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return String(val);
    if (val instanceof Date) return `'${val.toISOString()}'`;
    return `'${String(val).replace(/'/g, "''")}'`;
}

async function backup() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Conectado a Supabase');

    // Crear carpeta backups si no existe
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = path.join(backupDir, `backup_${timestamp}.sql`);
    const lines = [];

    lines.push(`-- =============================================`);
    lines.push(`-- BACKUP BPA ALMACEN`);
    lines.push(`-- Fecha: ${new Date().toLocaleString('es-PE')}`);
    lines.push(`-- Base de datos: Supabase / PostgreSQL`);
    lines.push(`-- =============================================`);
    lines.push('');
    lines.push('SET session_replication_role = replica; -- deshabilita FK checks temporalmente');
    lines.push('');

    for (const tabla of TABLAS) {
        try {
            // Verificar que la tabla existe
            const exists = await client.query(
                `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`,
                [tabla]
            );
            if (!exists.rows[0].exists) {
                console.log(`⚠️  Tabla "${tabla}" no existe, saltando...`);
                continue;
            }

            const result = await client.query(`SELECT * FROM "${tabla}"`);
            lines.push(`-- Tabla: ${tabla} (${result.rows.length} filas)`);
            lines.push(`DELETE FROM "${tabla}";`);

            if (result.rows.length > 0) {
                const cols = result.fields.map(f => `"${f.name}"`).join(', ');
                for (const row of result.rows) {
                    const vals = result.fields.map(f => escapeVal(row[f.name])).join(', ');
                    lines.push(`INSERT INTO "${tabla}" (${cols}) VALUES (${vals});`);
                }
            }
            lines.push('');
            console.log(`  ✔ ${tabla}: ${result.rows.length} filas`);
        } catch (err) {
            console.log(`  ✖ ${tabla}: error — ${err.message}`);
            lines.push(`-- ERROR en ${tabla}: ${err.message}`);
            lines.push('');
        }
    }

    lines.push('SET session_replication_role = DEFAULT; -- rehabilita FK checks');
    lines.push('');
    lines.push(`-- FIN DEL BACKUP`);

    fs.writeFileSync(filename, lines.join('\n'), 'utf8');
    await client.end();

    const sizeKb = (fs.statSync(filename).size / 1024).toFixed(1);
    console.log(`\n✅ Backup guardado en: ${filename}`);
    console.log(`   Tamaño: ${sizeKb} KB`);
}

backup().catch(err => {
    console.error('❌ Error durante el backup:', err.message);
    process.exit(1);
});
