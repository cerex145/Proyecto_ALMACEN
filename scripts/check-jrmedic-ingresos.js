const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function check() {
    const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    
    try {
        await client.connect();
        
        console.log('📊 Todos los ingresos de JR MEDIC:\n');
        const todos = await client.query(`
            SELECT DISTINCT 
                ni.numero_documento,
                COUNT(nid.id) as cantidad_detalles
            FROM nota_ingreso_detalles nid
            JOIN notas_ingreso ni ON nid.nota_ingreso_id = ni.id
            JOIN productos p ON nid.producto_id = p.id
            JOIN clientes c ON p.cliente_id = c.id
            WHERE c.razon_social = 'JR MEDIC E.I.R.L.'
            GROUP BY ni.numero_documento
            ORDER BY ni.numero_documento
        `);
        
        console.log(`Total de ingresos: ${todos.rows.length}\n`);
        todos.rows.forEach(row => {
            console.log(`  Doc: ${row.numero_documento} - ${row.cantidad_detalles} detalles`);
        });
        
        console.log('\n\n📊 Stock actual de productos JR MEDIC:\n');
        const stock = await client.query(`
            SELECT 
                p.codigo,
                p.descripcion,
                COALESCE((
                    SELECT COALESCE(k.saldo, 0)
                    FROM kardex k
                    WHERE k.producto_id = p.id
                    ORDER BY k.id DESC
                    LIMIT 1
                ), 0) as saldo_kardex
            FROM productos p
            JOIN clientes c ON p.cliente_id = c.id
            WHERE c.razon_social = 'JR MEDIC E.I.R.L.'
            ORDER BY p.codigo
        `);
        
        console.log(`Total productos: ${stock.rows.length}\n`);
        stock.rows.forEach(row => {
            const marker = row.saldo_kardex > 0 ? '❌' : '✅';
            console.log(`  ${marker} ${row.codigo}: ${row.descripcion} - Saldo: ${row.saldo_kardex}`);
        });
        
    } catch(err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
