/**
 * cleanup-db.js — Script para borrar transacciones y productos 
 * dejando únicamente a los vinculados a SUmedin y sunix.
 * (Mantiene los clientes intactos).
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanup() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN'); // Transacción para seguridad
        console.log('🔄 Extrayendo registros permitidos...');

        // 1. Identificar clientes permitidos por ID
        const resClientes = await client.query(`
            SELECT id FROM clientes 
            WHERE LOWER(razon_social) LIKE '%sumedin%' 
               OR LOWER(razon_social) LIKE '%sunix%'
        `);
        const allowedClientIds = resClientes.rows.map(r => r.id);
        const inClauseClientes = allowedClientIds.length > 0 ? allowedClientIds.join(',') : '-1';
        
        let keepCondition = `(COALESCE(LOWER(proveedor), '') LIKE '%sumedin%' OR COALESCE(LOWER(proveedor), '') LIKE '%sunix%')`;
        let keepClientCondition = `(COALESCE(cliente_id, -1) IN (${inClauseClientes}) OR COALESCE(LOWER(cliente_ruc), '') LIKE '%sumedin%' OR COALESCE(LOWER(cliente_ruc), '') LIKE '%sunix%')`;

        // -------------------------------------------------------------
        // PASO 1: Eliminar Notas de Salida No Permitidas
        // -------------------------------------------------------------
        const resSalidas = await client.query(`SELECT id FROM notas_salida WHERE NOT (${keepClientCondition})`);
        const salidaIds = resSalidas.rows.map(r => r.id);
        if (salidaIds.length > 0) {
            const inIds = salidaIds.join(',');
            await client.query(`DELETE FROM nota_salida_detalles WHERE nota_salida_id IN (${inIds})`);
            // El kardex también genera referencia aquí
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento = 'SALIDA' AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_salida WHERE id IN (${inIds})`);
            console.log(`✔️  ${salidaIds.length} Notas de Salida (y sus detalles) eliminadas.`);
        }

        // -------------------------------------------------------------
        // PASO 2: Eliminar Notas de Ingreso No Permitidas
        // -------------------------------------------------------------
        const resIngresos = await client.query(`SELECT id FROM notas_ingreso WHERE NOT (${keepCondition} OR ${keepClientCondition})`);
        const ingresoIds = resIngresos.rows.map(r => r.id);
        if (ingresoIds.length > 0) {
            const inIds = ingresoIds.join(',');
            
            // Eliminar dependencias indirectas (Actas de recepción)
            const resActas = await client.query(`SELECT id FROM actas_recepcion WHERE nota_ingreso_id IN (${inIds})`);
            const actasIds = resActas.rows.map(r => r.id);
            if (actasIds.length > 0) {
                await client.query(`DELETE FROM acta_recepcion_detalles WHERE acta_recepcion_id IN (${actasIds.join(',')})`);
                await client.query(`DELETE FROM actas_recepcion WHERE id IN (${actasIds.join(',')})`);
            }

            await client.query(`DELETE FROM lotes WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento IN ('INGRESO', 'AJUSTE_POR_RECEPCION') AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_ingreso WHERE id IN (${inIds})`);
            console.log(`✔️  ${ingresoIds.length} Notas de Ingreso (y actas/lotes vinculados) eliminadas.`);
        }

        // -------------------------------------------------------------
        // PASO 3: Eliminar Productos No Permitidos
        // -------------------------------------------------------------
        const resProds = await client.query(`SELECT id FROM productos WHERE NOT (${keepCondition} OR ${keepClientCondition})`);
        const prodsIds = resProds.rows.map(r => r.id);
        if (prodsIds.length > 0) {
            const inIds = prodsIds.join(',');
            
            // Limpiar todo historial de ese producto antes de eliminarlo
            await client.query(`DELETE FROM alertas_vencimiento WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM ajustes_stock WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM lotes WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE producto_id IN (${inIds})`);
            
            // Precaución extra para detalles de notas no eliminadas pero que tenían este producto
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_salida_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM acta_recepcion_detalles WHERE producto_id IN (${inIds})`);
            
            await client.query(`DELETE FROM productos WHERE id IN (${inIds})`);
            console.log(`✔️  ${prodsIds.length} Productos (y su histórico kardex local) eliminados.`);
        }

        await client.query('COMMIT');
        console.log('✅ PROCESO DE LIMPIEZA DE DATOS COMPLETADO CON ÉXITO');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ SE DETECTÓ UN ERROR. REVIRTIENDO LOS CAMBIOS...');
        console.error(err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

cleanup();
