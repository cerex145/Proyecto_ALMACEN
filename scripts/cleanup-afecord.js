/**
 * cleanup-afecord.js — Script para borrar transacciones EXCLUSIVAMENTE de afecord
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanupAfecord() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN'); // Transacción para seguridad
        console.log('🔄 Iniciando búsqueda quirúrgica de AFECORD...');

        // 1. Identificar clientes etiquetados literalmente como "afecord"
        const resClientes = await client.query(`
            SELECT id FROM clientes 
            WHERE LOWER(razon_social) LIKE '%afecord%' 
        `);
        const afecordIds = resClientes.rows.map(r => r.id);
        const inClause = afecordIds.length > 0 ? afecordIds.join(',') : '-1';
        
        let matchCondition = `(COALESCE(LOWER(proveedor), '') LIKE '%afecord%')`;
        let matchClientCondition = `(COALESCE(cliente_id, -1) IN (${inClause}) OR COALESCE(LOWER(cliente_ruc), '') LIKE '%afecord%')`;

        // -------------------------------------------------------------
        // PASO 1: Eliminar Notas de Salida de Afecord
        // -------------------------------------------------------------
        const resSalidas = await client.query(`SELECT id FROM notas_salida WHERE ${matchClientCondition}`);
        const salidaIds = resSalidas.rows.map(r => r.id);
        if (salidaIds.length > 0) {
            const inIds = salidaIds.join(',');
            await client.query(`DELETE FROM nota_salida_detalles WHERE nota_salida_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento = 'SALIDA' AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_salida WHERE id IN (${inIds})`);
            console.log(`✔️  ${salidaIds.length} Notas de Salida (y sus detalles/kardex) de Afecord eliminadas.`);
        }

        // -------------------------------------------------------------
        // PASO 2: Eliminar Notas de Ingreso de Afecord
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
            await client.query(`DELETE FROM kardex WHERE tipo_movimiento IN ('INGRESO', 'AJUSTE_POR_RECEPCION') AND referencia_id IN (${inIds})`);
            await client.query(`DELETE FROM notas_ingreso WHERE id IN (${inIds})`);
            console.log(`✔️  ${ingresoIds.length} Notas de Ingreso (y actas/lotes/kardex) de Afecord eliminadas.`);
        }

        // -------------------------------------------------------------
        // PASO 3: Eliminar Productos (SI, Y SOLO SI, dicen ser exclusivamente de afecord)
        // -------------------------------------------------------------
        const resProds = await client.query(`SELECT id FROM productos WHERE ${matchCondition} OR ${matchClientCondition}`);
        const prodsIds = resProds.rows.map(r => r.id);
        if (prodsIds.length > 0) {
            const inIds = prodsIds.join(',');
            
            // Limpiar datos relacionados
            await client.query(`DELETE FROM alertas_vencimiento WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM ajustes_stock WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM lotes WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE producto_id IN (${inIds})`);
            
            // Limpiar detalles huerfanos si hay
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_salida_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM acta_recepcion_detalles WHERE producto_id IN (${inIds})`);
            
            await client.query(`DELETE FROM productos WHERE id IN (${inIds})`);
            console.log(`✔️  ${prodsIds.length} Productos EXCLUSIVAMENTE marcados como Afecord eliminados.`);
        }

        await client.query('COMMIT');
        
        let sum = salidaIds.length + ingresoIds.length + prodsIds.length;
        if (sum === 0) {
            console.log('✅ NO SE ENCONTRÓ NADA DE AFECORD PARA BORRAR. EL SISTEMA ESTÁ LIMPIO.');
        } else {
            console.log('✅ OPERACIÓN QUIRÚRGICA CONTRA AFECORD COMPLETADA CON ÉXITO.');
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ ERROR GRAVE EN LA LIMPIEZA. DESHACIENDO CAMBIOS...');
        console.error(err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

cleanupAfecord();
