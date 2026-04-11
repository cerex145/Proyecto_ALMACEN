const { Client } = require('pg');
require('dotenv').config({ path: 'apps/api/.env' });

async function run() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'almacen_db'
    });

    try {
        await client.connect();
        
        console.log("Conectado. Buscando cliente...");
        const resClientes = await client.query(`
            SELECT id, razon_social, cuit FROM clientes 
            WHERE cuit = '20605390332' OR razon_social ILIKE '%HDM%CAPITAL%'
        `);
        console.log("Clientes encontrados:", resClientes.rows);
        
        const clienteIds = resClientes.rows.map(r => r.id);
        
        // Buscar notas de ingreso
        const niQuery = `
            SELECT id, numero_documento FROM notas_ingreso 
            WHERE cliente_ruc = '20605390332'
               OR proveedor_ruc = '20605390332'
               OR proveedor ILIKE '%HDM%CAPITAL%'
               ${clienteIds.length > 0 ? "OR cliente_id IN (" + clienteIds.join(',') + ")" : ""}
        `;
        const resNI = await client.query(niQuery);
        console.log("Notas Ingreso a eliminar:", resNI.rowCount);
        const niIds = resNI.rows.map(r => r.id);

        // Buscar notas de salida
        const nsQuery = `
            SELECT id FROM notas_salida
            WHERE ${clienteIds.length > 0 ? "cliente_id IN (" + clienteIds.join(',') + ")" : "1=0"}
        `;
        const resNS = await client.query(nsQuery);
        console.log("Notas Salida a eliminar:", resNS.rowCount);
        const nsIds = resNS.rows.map(r => r.id);

        console.log("IDs de Ingresos:", niIds);
        console.log("IDs de Salidas:", nsIds);

        // TODO: Eliminar registros

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
