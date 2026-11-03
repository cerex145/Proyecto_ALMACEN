const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // Check ingresados for product_id = 4
    const res = await client.query(`
      SELECT d.id, d.nota_ingreso_id, d.producto_id, d.lote_numero, d.cantidad, p.descripcion
      FROM nota_ingreso_detalles d
      JOIN productos p ON d.producto_id = p.id
      WHERE d.producto_id = 4
    `);
    console.log('--- DETALLES DE INGRESO PARA PRODUCTO 4 ---');
    console.table(res.rows);

    // Also let's check lotes for product_id = 4
    const resLotes = await client.query(`
      SELECT id, producto_id, numero_lote, cantidad_ingresada, cantidad_disponible
      FROM lotes
      WHERE producto_id = 4
    `);
    console.log('--- LOTES PARA PRODUCTO 4 ---');
    console.table(resLotes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
