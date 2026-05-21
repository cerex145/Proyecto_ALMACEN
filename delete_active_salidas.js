const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Iniciando proceso de reversión de stock y eliminación de salidas...');

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
    console.log(`Clientes AFECORP con IDs: ${clientIdsStr}`);

    // 2. Obtener todas las notas de salida para este cliente
    const salidasRes = await client.query(`
      SELECT id, numero_salida, estado FROM notas_salida WHERE cliente_id IN (${clientIdsStr})
    `);
    
    if (salidasRes.rows.length === 0) {
      console.log('No hay notas de salida registradas para AFECORP. Ya está en 0.');
      await client.end();
      return;
    }

    const salidas = salidasRes.rows;
    console.log(`Se encontraron ${salidas.length} notas de salida:`, salidas);

    // Iniciar transacción
    await client.query('BEGIN');

    for (const nota of salidas) {
      console.log(`\nProcesando Nota de Salida ID: ${nota.id}, Número: ${nota.numero_salida}, Estado: ${nota.estado}`);

      // Si el estado es activo (REGISTRADA, DESPACHADA, etc.), debemos revertir el stock en los lotes
      if (nota.estado !== 'CANCELADA') {
        console.log(`La nota está en estado activo (${nota.estado}). Revirtiendo stock...`);

        // Obtener detalles de esta salida
        const detallesRes = await client.query(`
          SELECT * FROM nota_salida_detalles WHERE nota_salida_id = $1
        `, [nota.id]);

        console.log(`Encontrados ${detallesRes.rows.length} detalles para revertir.`);

        for (const detalle of detallesRes.rows) {
          const cantidad = Number(detalle.cantidad);
          const productoId = detalle.producto_id;
          const loteNumero = String(detalle.lote_numero || '').trim();

          console.log(`  -> Revertiendo Producto ID: ${productoId}, Lote: "${loteNumero}", Cantidad: ${cantidad}`);

          // Buscar el lote en la base de datos
          const loteRes = await client.query(`
            SELECT id, cantidad_disponible, numero_lote 
            FROM lotes 
            WHERE producto_id = $1 AND numero_lote = $2
          `, [productoId, loteNumero]);

          if (loteRes.rows.length > 0) {
            for (const lote of loteRes.rows) {
              const nuevaCant = Number(lote.cantidad_disponible) + cantidad;
              await client.query(`
                UPDATE lotes SET cantidad_disponible = $1 WHERE id = $2
              `, [nuevaCant, lote.id]);
              console.log(`     Lote ID ${lote.id} actualizado. Stock anterior: ${lote.cantidad_disponible}, Stock nuevo: ${nuevaCant}`);
            }
          } else {
            console.log(`     [WARN] No se encontró el lote "${loteNumero}" para el producto ID ${productoId}. No se pudo restaurar stock en la tabla lotes.`);
          }
        }
      } else {
        console.log('La nota ya está CANCELADA. El stock ya fue devuelto por el sistema.');
      }

      // 3. Eliminar detalles de nota_salida_detalles para esta nota
      const delDetalles = await client.query(`
        DELETE FROM nota_salida_detalles WHERE nota_salida_id = $1
      `, [nota.id]);
      console.log(`Eliminados ${delDetalles.rowCount} detalles de nota_salida_detalles.`);

      // 4. Eliminar movimientos de kardex para esta nota
      const delKardex = await client.query(`
        DELETE FROM kardex 
        WHERE (documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA') AND referencia_id = $1)
           OR (documento_tipo IN ('NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA') AND documento_numero = $2)
      `, [nota.id, nota.numero_salida]);
      console.log(`Eliminados ${delKardex.rowCount} movimientos de kardex.`);

      // 5. Eliminar la nota de salida
      const delNota = await client.query(`
        DELETE FROM notas_salida WHERE id = $1
      `, [nota.id]);
      console.log(`Eliminada la nota de salida de la tabla notas_salida.`);
    }

    // Confirmar transacción
    await client.query('COMMIT');
    console.log('\n¡Eliminación y reversión completadas con éxito!');

  } catch (error) {
    console.error('Error durante la eliminación, haciendo ROLLBACK:', error);
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
}

main().catch(err => console.error(err));
