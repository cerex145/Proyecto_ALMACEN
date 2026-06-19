const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('=== INICIANDO MIGRACIÓN DE PRODUCTOS COMPARTIDOS ===');

    try {
        await client.query('BEGIN');
        console.log('Transacción iniciada.');

        // 1. Cargar clientes
        const resClientes = await client.query('SELECT id, cuit, razon_social FROM clientes');
        const clientesMap = new Map();
        for (const c of resClientes.rows) {
            clientesMap.set(Number(c.id), c);
        }
        console.log(`Cargados ${clientesMap.size} clientes.`);

        // 2. Cargar todos los productos actuales
        const resProductos = await client.query(`
            SELECT id, codigo, descripcion, proveedor, proveedor_ruc, cliente_id, cliente_ruc, 
                   fabricante, procedencia, lote, registro_sanitario, temperatura_min_c, temperatura_max_c, activo 
            FROM productos
        `);
        const productosById = new Map();
        const productosByKey = new Map(); // key: "codigo|cliente_id"

        for (const p of resProductos.rows) {
            const pId = Number(p.id);
            const cliId = p.cliente_id ? Number(p.cliente_id) : null;
            productosById.set(pId, p);
            if (cliId !== null) {
                productosByKey.set(`${p.codigo.trim()}|${cliId}`, pId);
            }
        }
        console.log(`Cargados ${productosById.size} productos existentes.`);

        // Función auxiliar para obtener o crear producto para un cliente específico
        const getOrCreateProductId = async (originalProductId, actualClienteId) => {
            const originalProduct = productosById.get(originalProductId);
            if (!originalProduct) {
                throw new Error(`Producto original ID ${originalProductId} no encontrado en caché.`);
            }

            const code = originalProduct.codigo.trim();
            const key = `${code}|${actualClienteId}`;

            if (productosByKey.has(key)) {
                return productosByKey.get(key);
            }

            // Crear nuevo producto duplicando campos pero asignando al cliente correcto
            const cli = clientesMap.get(actualClienteId);
            if (!cli) {
                throw new Error(`Cliente ID ${actualClienteId} no encontrado en base de datos.`);
            }

            console.log(`[CREAR] Duplicando producto "${code}" para cliente "${cli.razon_social}" (ID: ${actualClienteId})`);

            const resInsert = await client.query(`
                INSERT INTO productos (
                    codigo, descripcion, proveedor, proveedor_ruc, cliente_id, cliente_ruc, 
                    fabricante, procedencia, lote, registro_sanitario, temperatura_min_c, temperatura_max_c, activo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            `, [
                originalProduct.codigo,
                originalProduct.descripcion,
                cli.razon_social,      // proveedor = razon social del cliente
                cli.cuit,              // proveedor_ruc = cuit del cliente
                actualClienteId,
                cli.cuit,              // cliente_ruc
                originalProduct.fabricante,
                originalProduct.procedencia,
                originalProduct.lote,
                originalProduct.registro_sanitario,
                originalProduct.temperatura_min_c,
                originalProduct.temperatura_max_c,
                originalProduct.activo
            ]);

            const newId = Number(resInsert.rows[0].id);

            // Guardar en caché local para reutilizarlo en la migración
            const newProduct = { ...originalProduct, id: newId, cliente_id: actualClienteId, cliente_ruc: cli.cuit, proveedor: cli.razon_social };
            productosById.set(newId, newProduct);
            productosByKey.set(key, newId);

            return newId;
        };

        // 3. Migrar nota_ingreso_detalles
        console.log('\n--- Migrando detalles de Nota de Ingreso ---');
        const resNid = await client.query(`
            SELECT nid.id as detail_id, nid.producto_id, ni.cliente_id as actual_cliente_id
            FROM nota_ingreso_detalles nid
            JOIN notas_ingreso ni ON nid.nota_ingreso_id = ni.id
        `);
        let countNid = 0;
        for (const row of resNid.rows) {
            const detailId = Number(row.detail_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE nota_ingreso_detalles SET producto_id = $1 WHERE id = $2', [targetPid, detailId]);
                countNid++;
            }
        }
        console.log(`Actualizados ${countNid} detalles de Nota de Ingreso.`);

        // 4. Migrar nota_salida_detalles
        console.log('\n--- Migrando detalles de Nota de Salida ---');
        const resNsd = await client.query(`
            SELECT nsd.id as detail_id, nsd.producto_id, ns.cliente_id as actual_cliente_id
            FROM nota_salida_detalles nsd
            JOIN notas_salida ns ON nsd.nota_salida_id = ns.id
        `);
        let countNsd = 0;
        for (const row of resNsd.rows) {
            const detailId = Number(row.detail_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE nota_salida_detalles SET producto_id = $1 WHERE id = $2', [targetPid, detailId]);
                countNsd++;
            }
        }
        console.log(`Actualizados ${countNsd} detalles de Nota de Salida.`);

        // 5. Migrar lotes
        console.log('\n--- Migrando Lotes ---');
        const resLotes = await client.query(`
            SELECT l.id as lote_id, l.producto_id, ni.cliente_id as actual_cliente_id
            FROM lotes l
            JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
        `);
        let countLotes = 0;
        for (const row of resLotes.rows) {
            const loteId = Number(row.lote_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE lotes SET producto_id = $1 WHERE id = $2', [targetPid, loteId]);
                countLotes++;
            }
        }
        console.log(`Actualizados ${countLotes} Lotes.`);

        // 6. Migrar Kardex
        console.log('\n--- Migrando Kardex ---');
        // 6.1 Ingresses
        const resKardexIng = await client.query(`
            SELECT k.id as kardex_id, k.producto_id, ni.cliente_id as actual_cliente_id
            FROM kardex k
            JOIN notas_ingreso ni ON k.referencia_id = ni.id 
                 AND k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente')
        `);
        let countKardex = 0;
        for (const row of resKardexIng.rows) {
            const kardexId = Number(row.kardex_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE kardex SET producto_id = $1 WHERE id = $2', [targetPid, kardexId]);
                countKardex++;
            }
        }

        // 6.2 Egresses
        const resKardexSal = await client.query(`
            SELECT k.id as kardex_id, k.producto_id, ns.cliente_id as actual_cliente_id
            FROM kardex k
            JOIN notas_salida ns ON k.referencia_id = ns.id 
                 AND k.documento_tipo = 'NOTA_SALIDA'
        `);
        for (const row of resKardexSal.rows) {
            const kardexId = Number(row.kardex_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE kardex SET producto_id = $1 WHERE id = $2', [targetPid, kardexId]);
                countKardex++;
            }
        }
        console.log(`Actualizados ${countKardex} movimientos de Kardex.`);

        // 7. Migrar acta_recepcion_detalles
        console.log('\n--- Migrando detalles de Acta de Recepción ---');
        const resArd = await client.query(`
            SELECT ard.id as detail_id, ard.producto_id, ar.cliente_id as actual_cliente_id
            FROM actas_recepcion_detalles ard
            JOIN actas_recepcion ar ON ard.acta_id = ar.id
        `);
        let countArd = 0;
        for (const row of resArd.rows) {
            const detailId = Number(row.detail_id);
            const originalPid = Number(row.producto_id);
            const actualCliId = Number(row.actual_cliente_id);

            const prod = productosById.get(originalPid);
            if (prod && Number(prod.cliente_id) !== actualCliId) {
                const targetPid = await getOrCreateProductId(originalPid, actualCliId);
                await client.query('UPDATE acta_recepcion_detalles SET producto_id = $1 WHERE id = $2', [targetPid, detailId]);
                countArd++;
            }
        }
        console.log(`Actualizados ${countArd} detalles de Acta de Recepción.`);

        await client.query('COMMIT');
        console.log('\n=== MIGRACIÓN COMPLETADA EXITOSAMENTE Y CONFIRMADA (COMMIT) ===');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ ERROR EN LA MIGRACIÓN. REALIZADO ROLLBACK:', error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
