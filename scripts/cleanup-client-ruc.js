/**
 * cleanup-client-ruc.js — Elimina Entradas y Salidas de un Cliente Específico
 * SOLO borra historial, salvaguarda el "Catálogo de Productos".
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanupRUC(targetRUC) {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN');
        console.log(`🔄 Iniciando búsqueda y destrucción. Objetivo: RUC ${targetRUC}`);

        // 1. Obtener ID del cliente (por si está almacenado relacionalmente)
        const resClientes = await client.query(`SELECT id FROM clientes WHERE cuit = $1`, [targetRUC]);
        const targetIds = resClientes.rows.map(r => r.id);
        const inClause = targetIds.length > 0 ? targetIds.join(',') : '-999999';
        
        const clientCondition = `(cliente_id IN (${inClause}))`;

        // -------------------------------------------------------------
        // PASO 1: Eliminar Notas de Salida 
        // -------------------------------------------------------------
        const resSalidas = await client.query(`SELECT id FROM notas_salida WHERE ${clientCondition}`);
        const salidaIds = resSalidas.rows.map(r => r.id);
        if (salidaIds.length > 0) {
            const inIds = salidaIds.join(',');
            await client.query(`DELETE FROM nota_salida_detalles WHERE nota_salida_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento = 'SALIDA' AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_salida WHERE id IN (${inIds})`);
            console.log(`✔️ Eliminadas ${salidaIds.length} Notas de Salida (y sus detalles/kardex) del Cliente.`);
        } else {
            console.log(`❕ No se encontraron Notas de Salida para el RUC ${targetRUC}.`);
        }

        const resActas = await client.query(`SELECT id FROM actas_recepcion WHERE ${clientCondition} OR proveedor LIKE '%${targetRUC}%'`);
        const actasIds = resActas.rows.map(r => r.id);
        if (actasIds.length > 0) {
            await client.query(`DELETE FROM acta_recepcion_detalles WHERE acta_recepcion_id IN (${actasIds.join(',')})`);
            await client.query(`DELETE FROM actas_recepcion WHERE id IN (${actasIds.join(',')})`);
            console.log(`✔️ Eliminadas ${actasIds.length} Actas de Recepción.`);
        }

        // -------------------------------------------------------------
        // PASO 2: Eliminar Notas de Ingreso (Complejo)
        // -------------------------------------------------------------
        const resIngresos = await client.query(`
            SELECT id FROM notas_ingreso 
            WHERE ${clientCondition} OR proveedor LIKE '%${targetRUC}%'
        `);
        const ingresoIds = resIngresos.rows.map(r => r.id);
        if (ingresoIds.length > 0) {
            const inIds = ingresoIds.join(',');

            // Eliminar Lotes, Detalles de Ingreso y su Kardex
            await client.query(`DELETE FROM lotes WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE nota_ingreso_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento IN ('INGRESO', 'AJUSTE_POR_RECEPCION') AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_ingreso WHERE id IN (${inIds})`);
            console.log(`✔️ Eliminadas ${ingresoIds.length} Notas de Ingreso (y lotes/kardex) del Cliente.`);
        } else {
            console.log(`❕ No se encontraron Notas de Ingreso para el RUC ${targetRUC}.`);
        }

        await client.query('COMMIT');
        
        if (salidaIds.length === 0 && ingresoIds.length === 0) {
            console.log(`✅ NO HUBO MODIFICACIONES. Historial de RUC ${targetRUC} estaba en CERO u oculto.`);
        } else {
            console.log(`✅ ORDEN DE PURGA COMPLETADA CON ÉXITO. Sistema limpio de historiales de ${targetRUC}. El catálogo general sigue ileso.`);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ SE DETECTÓ UN ERROR. REVIRTIENDO...', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// target RUC solicitado
cleanupRUC('20605712241');
