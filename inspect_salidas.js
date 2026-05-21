const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  // Find AFECORP client
  const clientRes = await client.query(`
    SELECT * FROM clientes WHERE cuit = '20600124871' OR razon_social ILIKE '%afecor%'
  `);
  
  console.log('Clientes encontrados:');
  console.log(clientRes.rows);
  
  if (clientRes.rows.length === 0) {
    console.log('No se encontró el cliente AFECORP');
    await client.end();
    return;
  }
  
  const clientIds = clientRes.rows.map(r => r.id);
  const clientIdsStr = clientIds.join(',');
  
  // Find notas_salida for these clients
  const salidasRes = await client.query(`
    SELECT * FROM notas_salida WHERE cliente_id IN (${clientIdsStr})
  `);
  
  console.log(`\nNotas de salida encontradas para AFECORP (${salidasRes.rows.length}):`);
  console.log(salidasRes.rows);
  
  if (salidasRes.rows.length > 0) {
    const salidaIds = salidasRes.rows.map(r => r.id).join(',');
    
    // Find detalles
    const detallesRes = await client.query(`
      SELECT d.*, p.codigo as prod_codigo 
      FROM nota_salida_detalles d
      JOIN productos p ON d.producto_id = p.id
      WHERE d.nota_salida_id IN (${salidaIds})
    `);
    console.log(`\nDetalles de salida encontrados (${detallesRes.rows.length}):`);
    console.log(detallesRes.rows);
    
    // Find Kardex movements for these outputs
    const kardexRes = await client.query(`
      SELECT * FROM kardex 
      WHERE documento_tipo = 'NOTA_SALIDA' 
         OR referencia_id IN (${salidaIds})
    `);
    console.log(`\nMovimientos de Kardex relacionados (${kardexRes.rows.length}):`);
    console.log(kardexRes.rows);
  }

  await client.end();
}

main().catch(err => console.error(err));
