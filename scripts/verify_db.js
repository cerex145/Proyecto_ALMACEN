const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
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
