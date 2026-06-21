const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Configuralo en apps/api/.env antes de ejecutar este script.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

async function verify() {
  try {
    await client.connect();
    
    // Obtener nombres de las tablas
    const { rows } = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    `);
    
    console.log('--- ESTADO DE LAS TABLAS EN LA BASE DE DATOS ---');
    for (const r of rows) {
      const tableName = r.table_name;
      const countRes = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      console.log(`Tabla: ${tableName.padEnd(25)} | Registros: ${countRes.rows[0].count}`);
    }
  } catch (error) {
    console.error('Error durante la verificación:', error);
  } finally {
    await client.end();
  }
}

verify();
