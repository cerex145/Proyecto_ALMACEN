const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanup() {
    const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    
    try {
        await client.connect();
        
        console.log('🔍 Buscando movimientos de kardex del documento 00000143 (EXCEPTO hem-7154-e):\n');
        
        // Buscar kardex de documento 00000143
        const kardexAEliminar = await client.query(`
            SELECT k.id, k.tipo_movimiento, k.cantidad, k.saldo, p.codigo, p.descripcion, k.documento_numero
            FROM kardex k
            JOIN productos p ON k.producto_id = p.id
            JOIN clientes c ON p.cliente_id = c.id
            WHERE c.razon_social = 'JR MEDIC E.I.R.L.'
              AND k.documento_numero = '00000143'
              AND p.codigo != 'hem-7154-e'
            ORDER BY k.id
        `);
        
        console.log(`❌ Encontrados ${kardexAEliminar.rows.length} movimientos a eliminar:\n`);
        
        if (kardexAEliminar.rows.length > 0) {
            kardexAEliminar.rows.forEach(row => {
                console.log(`  ID ${row.id}: ${row.codigo} - ${row.tipo_movimiento} ${row.cantidad} unid (saldo: ${row.saldo})`);
            });
            
            const kardexIds = kardexAEliminar.rows.map(r => r.id);
            
            console.log(`\n⚠️  ELIMINANDO ${kardexAEliminar.rows.length} registros del kardex...\n`);
            
            // Eliminar los kardex
            await client.query(`DELETE FROM kardex WHERE id = ANY($1::int[])`, [kardexIds]);
            
            console.log(`✅ ${kardexAEliminar.rows.length} registros de kardex eliminados\n`);
        } else {
            console.log('✅ No hay movimientos del documento 00000143 para eliminar (excepto hem-7154-e)');
        }
        
        // Verificar saldos finales
        console.log('\n📊 Saldos finales de JR MEDIC después de la limpieza:\n');
        
        const final = await client.query(`
            SELECT 
                p.codigo,
                COALESCE((
                    SELECT COALESCE(k.saldo, 0)
                    FROM kardex k
                    WHERE k.producto_id = p.id
                    ORDER BY k.id DESC
                    LIMIT 1
                ), 0) as saldo_final
            FROM productos p
            JOIN clientes c ON p.cliente_id = c.id
            WHERE c.razon_social = 'JR MEDIC E.I.R.L.'
            ORDER BY p.codigo
        `);
        
        final.rows.forEach(row => {
            const marker = row.saldo_final > 0 ? '❌' : '✅';
            const special = row.codigo === 'hem-7154-e' ? ' 👈 (PROTEGIDO)' : '';
            console.log(`  ${marker} ${row.codigo}: ${row.saldo_final}${special}`);
        });
        
    } catch(err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

cleanup();
