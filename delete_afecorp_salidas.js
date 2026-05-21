const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Iniciando proceso de eliminación de salidas de AFECORP...');

  try {
    // 1. Obtener ID del cliente AFECORP
    const clientRes = await client.query(`
      SELECT id, razon_social FROM clientes WHERE cuit = '20600124871' OR razon_social ILIKE '%afecor%'
    `);
    
    if (clientRes.rows.length === 0) {
      console.log('No se encontró el cliente AFECORP.');
      await client.end();
      return;
    }
    
    const clientIds = clientRes.rows.map(r => r.id);
    const clientIdsStr = clientIds.join(',');
    console.log(`Clientes AFECORP encontrados con IDs: ${clientIdsStr} (${clientRes.rows.map(r => r.razon_social).join(', ')})`);

    // 2. Obtener IDs de las notas de salida para este cliente
    const salidasRes = await client.query(`
      SELECT id, numero_salida FROM notas_salida WHERE cliente_id IN (${clientIdsStr})
    `);
    
    if (salidasRes.rows.length === 0) {
      console.log('El cliente AFECORP no tiene notas de salida registradas. Ya está en 0.');
      await client.end();
      return;
    }

    const salidaIds = salidasRes.rows.map(r => r.id);
    const salidaIdsStr = salidaIds.join(',');
    console.log(`Notas de salida a eliminar: IDs [${salidaIdsStr}], Números: [${salidasRes.rows.map(r => r.numero_salida).join(', ')}]`);

    // Comenzar transacción
    await client.query('BEGIN');

    // 3. Eliminar detalles de nota_salida_detalles
    const delDetalles = await client.query(`
      DELETE FROM nota_salida_detalles WHERE nota_salida_id IN (${salidaIdsStr})
    `);
    console.log(`Eliminados ${delDetalles.rowCount} detalles de nota_salida_detalles.`);

    // 4. Eliminar movimientos de kardex relacionados
    // Buscamos por documento_tipo y referencia_id o por número de salida
    const delKardex = await client.query(`
      DELETE FROM kardex 
      WHERE (documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA') AND referencia_id IN (${salidaIdsStr}))
         OR (documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA') AND documento_numero IN (
              SELECT numero_salida FROM notas_salida WHERE cliente_id IN (${clientIdsStr})
            ))
    `);
    console.log(`Eliminados ${delKardex.rowCount} movimientos del kardex.`);

    // 5. Eliminar las notas_salida propiamente dichas
    const delSalidas = await client.query(`
      DELETE FROM notas_salida WHERE cliente_id IN (${clientIdsStr})
    `);
    console.log(`Eliminadas ${delSalidas.rowCount} notas de salida de la tabla notas_salida.`);

    // Confirmar transacción
    await client.query('COMMIT');
    console.log('¡Eliminación completada con éxito y confirmada en la base de datos!');

  } catch (error) {
    console.error('Error durante la eliminación, haciendo ROLLBACK:', error);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

main().catch(err => console.error(err));
