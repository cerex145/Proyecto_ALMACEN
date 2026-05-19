const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function check() {
    const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    
    try {
        await client.connect();
        
        console.log('📋 INGRESOS del documento 00000143:');
        const result = await client.query(`
            SELECT nid.id, p.id as prod_id, p.codigo, p.descripcion, ni.numero_documento, nid.cantidad
            FROM nota_ingreso_detalles nid
            JOIN notas_ingreso ni ON nid.nota_ingreso_id = ni.id
            JOIN productos p ON nid.producto_id = p.id
            WHERE ni.numero_documento = '00000143'
            ORDER BY p.codigo
        `);
        
        console.log(result.rows);
        
        console.log('\n🔍 Buscando hem-7154-e:');
        const hem = await client.query(`
            SELECT id, codigo, descripcion FROM productos WHERE codigo LIKE '%hem-7154%' OR descripcion LIKE '%hem-7154%'
        `);
        console.log(hem.rows);
        
        console.log('\n� Buscando producto qua8760:');
        const qua = await client.query(`
            SELECT id, codigo, descripcion FROM productos WHERE codigo LIKE '%qua8760%'
        `);
        console.log(qua.rows);
        
        if (qua.rows.length > 0) {
            const prod_id = qua.rows[0].id;
            console.log(`\n📊 KARDEX para qua8760 (id ${prod_id}):`);
            const kardexQua = await client.query(`
                SELECT k.id, k.tipo_movimiento, k.cantidad, k.saldo, p.codigo
                FROM kardex k
                JOIN productos p ON k.producto_id = p.id
                WHERE k.producto_id = $1
                ORDER BY k.id
            `, [prod_id]);
            console.log(kardexQua.rows);
        }
        
    } catch(err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

check();
