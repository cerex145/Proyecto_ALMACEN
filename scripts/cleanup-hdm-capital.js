const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanupHDMCapital() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN'); // Transacción para seguridad
        console.log('🔄 Iniciando búsqueda quirúrgica de ingresos y salidas de HDM CAPITAL...');

        // 1. Identificar cliente
        const resClientes = await client.query(`
            SELECT id FROM clientes 
            WHERE cuit = '20605390332' OR LOWER(razon_social) LIKE '%hdm%capital%' 
        `);
        const targetIds = resClientes.rows.map(r => r.id);
        const inClause = targetIds.length > 0 ? targetIds.join(',') : '-1';
        
        let matchCondition = `(COALESCE(LOWER(proveedor), '') LIKE '%hdm%capital%')`;
        let matchClientCondition = `(COALESCE(cliente_id, -1) IN (${inClause}) OR COALESCE(cliente_ruc, '') = '20605390332')`;

        // -------------------------------------------------------------
        // PASO 1: Eliminar Notas de Salida
        // -------------------------------------------------------------
        const resSalidas = await client.query(`SELECT id FROM notas_salida WHERE ${matchClientCondition}`);
        const salidaIds = resSalidas.rows.map(r => r.id);
        if (salidaIds.length > 0) {
            const inIds = salidaIds.join(',');
            await client.query(`DELETE FROM nota_salida_detalles WHERE nota_salida_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO') AND referencia_id IN (${inIds}) AND documento_tipo = 'NOTA_SALIDA'`);
            await client.query(`DELETE FROM notas_salida WHERE id IN (${inIds})`);
            console.log(`✔️  ${salidaIds.length} Notas de Salida (y sus detalles/kardex) de HDM Capital eliminadas.`);
        }

        // -------------------------------------------------------------
        // PASO 2: Eliminar Notas de Ingreso
        // -------------------------------------------------------------
        const resIngresos = await client.query(`SELECT id FROM notas_ingreso WHERE ${matchCondition} OR ${matchClientCondition}`);
        const ingresoIds = resIngresos.rows.map(r => r.id);
        if (ingresoIds.length > 0) {
            const inIds = ingresoIds.join(',');
            
            // Eliminar actas de recepción de esos ingresos
            const resActas = await client.query(`SELECT id FROM actas_recepcion WHERE nota_ingreso_id IN (${inIds})`);
            const actasIds = resActas.rows.map(r => r.id);
            if (actasIds.length > 0) {
                await client.query(`DELETE FROM acta_recepcion_detalles WHERE acta_recepcion_id IN (${actasIds.join(',')})`);
                await client.query(`DELETE FROM actas_recepcion WHERE id IN (${actasIds.join(',')})`);
            }

            await client.query(`DELETE FROM lotes WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento IN ('INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION') AND referencia_id IN (${inIds}) AND documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente')`);
            await client.query(`DELETE FROM kardex WHERE referencia_id IN (${inIds}) AND documento_tipo IN ('NOTA_INGRESO')`); // Fallback just in case
            await client.query(`DELETE FROM notas_ingreso WHERE id IN (${inIds})`);
            console.log(`✔️  ${ingresoIds.length} Notas de Ingreso (y actas/lotes/kardex) de HDM Capital eliminadas.`);
        }

        await client.query('COMMIT');
        
        let sum = salidaIds.length + ingresoIds.length;
        if (sum === 0) {
            console.log('✅ NO SE ENCONTRÓ NINGÚN MOVIMIENTO DE HDM CAPITAL PARA BORRAR.');
        } else {
            console.log('✅ OPERACIÓN DE BORRADO DE MOVIMIENTOS COMPLETADA CON ÉXITO.');
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ ERROR GRAVE EN LA ELIMINACIÓN. DESHACIENDO CAMBIOS...');
        console.error(err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

cleanupHDMCapital();
