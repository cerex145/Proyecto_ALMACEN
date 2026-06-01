const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`
    SELECT p.codigo, l.numero_lote, l.cantidad_disponible, ni.proveedor, ni.id as ingreso_id, ni.cliente_ruc
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
    LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
    WHERE p.codigo IN ('NVT23030', 'TSCMG-35-260-LESDC', '41300150', 'RSC061125-HW45', '53610009', 'RS*R60N10MQ', 'AHW14R001S')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
