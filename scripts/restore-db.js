/**
 * restore-db.js — Restaura la base de datos desde el último backup SQL
 * Uso: node scripts/restore-db.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function restore() {
    // Encontrar el backup más reciente
    const backupDir = path.join(__dirname, '..', 'backups');
    const archivos = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
        .sort()
        .reverse();

    if (archivos.length === 0) {
        console.error('❌ No hay archivos de backup en la carpeta backups/');
        process.exit(1);
    }

    const ultimo = archivos[0];
    const rutaBackup = path.join(backupDir, ultimo);
    const sizeKb = (fs.statSync(rutaBackup).size / 1024).toFixed(1);

    console.log(`📂 Último backup encontrado: ${ultimo} (${sizeKb} KB)`);
    console.log('🔄 Iniciando restauración...\n');

    const sql = fs.readFileSync(rutaBackup, 'utf8');

    // Separar en sentencias individuales (split por ;\n o ;$ )
    const sentencias = sql
        .split('\n')
        .reduce((acc, line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('--')) return acc; // ignorar comentarios y líneas vacías
            acc.push(trimmed);
            return acc;
        }, [])
        .join('\n')
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    let ok = 0;
    let errores = 0;

    for (const stmt of sentencias) {
        if (!stmt) continue;
        try {
            await client.query(stmt);
            ok++;
            // Mostrar progreso en operaciones DELETE/INSERT importantes
            if (stmt.startsWith('DELETE') || stmt.startsWith('SET')) {
                const tabla = stmt.match(/FROM "([^"]+)"/)?.[1] || '';
                if (tabla) console.log(`  🗑  Limpiada tabla: ${tabla}`);
            }
        } catch (err) {
            errores++;
            console.warn(`  ⚠️  Error en sentencia: ${stmt.slice(0, 80)}...`);
            console.warn(`     → ${err.message}\n`);
        }
    }

    await client.end();

    console.log(`\n✅ Restauración completada`);
    console.log(`   Sentencias ejecutadas: ${ok}`);
    if (errores > 0) console.log(`   Con errores: ${errores}`);
    console.log(`   Backup restaurado: ${ultimo}`);
}

restore().catch(err => {
    console.error('❌ Error fatal durante la restauración:', err.message);
    process.exit(1);
});
