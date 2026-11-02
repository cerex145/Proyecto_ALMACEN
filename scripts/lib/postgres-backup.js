const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

function connectionEnv(databaseUrl, env = process.env) {
    if (!databaseUrl) throw new Error('Falta DATABASE_URL en apps/api/.env');
    const url = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL debe ser una conexión PostgreSQL');
    return { ...env, PGHOST: url.hostname, PGPORT: url.port || '5432',
        PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: env.DB_SSL === 'false' ? 'disable' : 'require',
        PGCONNECT_TIMEOUT: '30' };
}

function run(binary, args, env) {
    return new Promise((resolve, reject) => {
        const child = spawn(binary, args, { env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
        let error = '';
        child.stdout.resume();
        child.stderr.on('data', data => { error = (error + data).slice(-8000); });
        child.on('error', err => reject(new Error(err.code === 'ENOENT'
            ? `No se encontró ${path.basename(binary)}. Agregue las herramientas de PostgreSQL al PATH.` : err.message)));
        child.on('close', code => code === 0 ? resolve() : reject(new Error(error.trim() || `La herramienta PostgreSQL terminó con código ${code}`)));
    });
}

function validateDump(file) {
    const fd = fs.openSync(file, 'r');
    try {
        const header = Buffer.alloc(5);
        if (fs.readSync(fd, header, 0, 5, 0) !== 5 || header.toString() !== 'PGDMP') {
            throw new Error('El archivo no es un respaldo PostgreSQL en formato custom');
        }
    } finally { fs.closeSync(fd); }
}

async function backupDatabase({ databaseUrl = process.env.DATABASE_URL, outputDir = path.resolve(__dirname, '../../backups'),
    env = process.env, runner = run } = {}) {
    const connection = connectionEnv(databaseUrl, env);
    fs.mkdirSync(outputDir, { recursive: true });
    const name = `almacen_${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID()}.dump`;
    const target = path.join(outputDir, name);
    const temporary = target + '.partial';
    try {
        await runner(env.PG_DUMP_BIN || 'pg_dump', [
            '--format=custom', '--schema=public', '--no-owner', '--no-privileges', '--file', temporary
        ], connection);
        validateDump(temporary);
        fs.renameSync(temporary, target);
        return target;
    } catch (error) {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
        throw error;
    }
}

async function restoreDatabase({ file, confirmed = false, databaseUrl = process.env.DATABASE_URL,
    outputDir, env = process.env, runner = run } = {}) {
    if (!confirmed || !file) throw new Error('Indique --file RUTA y --confirm-restore para restaurar explícitamente ese respaldo');
    const target = path.resolve(file);
    validateDump(target);
    const connection = connectionEnv(databaseUrl, env);
    await runner(env.PG_RESTORE_BIN || 'pg_restore', ['--list', target], connection);
    const safetyBackup = await backupDatabase({ databaseUrl, outputDir, env, runner });
    await runner(env.PG_RESTORE_BIN || 'pg_restore', [
        '--clean', '--if-exists', '--no-owner', '--no-privileges', '--exit-on-error', '--single-transaction', target
    ], connection);
    return { restored: target, safetyBackup };
}

module.exports = { backupDatabase, restoreDatabase, connectionEnv, validateDump };
