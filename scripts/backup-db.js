const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/api/.env') });
const { backupDatabase } = require('./lib/postgres-backup');

async function main() {
    const output = process.argv.indexOf('--out');
    const file = await backupDatabase({ outputDir: output >= 0 ? path.resolve(process.argv[output + 1]) : path.join(__dirname, '../backups') });
    console.log(`Respaldo completo del esquema público guardado en: ${file}`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { main, backupDatabase };
