const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/api/.env') });
const { restoreDatabase } = require('./lib/postgres-backup');

async function main() {
    const index = process.argv.indexOf('--file');
    const result = await restoreDatabase({
        file: index >= 0 ? process.argv[index + 1] : undefined,
        confirmed: process.argv.includes('--confirm-restore'), outputDir: path.join(__dirname, '../backups')
    });
    console.log(`Restauración completada: ${result.restored}`);
    console.log(`Respaldo previo a la restauración: ${result.safetyBackup}`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { main, restoreDatabase };
