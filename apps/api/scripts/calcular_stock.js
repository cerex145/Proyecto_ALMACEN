/**
 * Calcula y actualiza el stock actual de todos los productos
 * basándose en ingresos y salidas
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(80));
console.log('📊 CALCULANDO STOCK DE PRODUCTOS');
console.log('═'.repeat(80) + '\n');

async function calcularStock() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conectado a BD\n');
        
        // Obtener todos los productos
        const [productos] = await conn.execute('SELECT id FROM productos');
        console.log(`📦 ${productos.length} productos encontrados\n`);
        
        let actualizado = 0;
        let errores = 0;
        
        for (const prod of productos) {
            try {
                const prodId = prod.id;
                
                // Sumar ingresos
                const [ingresos] = await conn.execute(
                    `SELECT COALESCE(SUM(cantidad_total), 0) as total 
                     FROM nota_ingreso_detalles 
                     WHERE producto_id = ?`,
                    [prodId]
                );
                const totalIngresos = Number(ingresos[0].total) || 0;
                
                // Sumar salidas
                const [salidas] = await conn.execute(
                    `SELECT COALESCE(SUM(cantidad_total), 0) as total 
                     FROM nota_salida_detalles 
                     WHERE producto_id = ?`,
                    [prodId]
                );
                const totalSalidas = Number(salidas[0].total) || 0;
                
                // Stock = Ingresos - Salidas
                const stock = totalIngresos - totalSalidas;
                
                // Actualizar stock en productos
                await conn.execute(
                    'UPDATE productos SET stock_actual = ? WHERE id = ?',
                    [stock, prodId]
                );
                
                actualizado++;
                if (actualizado % 100 === 0) {
                    console.log(`  ✓ ${actualizado}/${productos.length} procesados...`);
                }
            } catch (e) {
                errores++;
                console.log(`  ⚠️  Producto ${prod.id}: ${e.message}`);
            }
        }
        
        console.log(`\n✅ CÁLCULO COMPLETADO`);
        console.log(`   Productos actualizados: ${actualizado}`);
        console.log(`   Errores: ${errores}`);
        console.log('═'.repeat(80) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

calcularStock();
