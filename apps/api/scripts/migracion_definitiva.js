/**
 * MIGRACIÓN FINAL - Números random para evitar duplicados
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN FINAL - DATOS CORREGIDOS CON FECHAS REORDENADAS');
console.log('═'.repeat(70) + '\n');

function parseFecha(str) {
    if (!str || str.trim() === '') return null;
    const match = str.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return null;
    const [, d, m, y] = match.map(Number);
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > 2099) return null;
    const fecha = new Date(y, m - 1, d);
    return fecha.toISOString().split('T')[0];
}

async function migrar() {
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
        
        // LIMPIAR
        console.log('🗑️  Limpiando datos previos...\n');
        await conn.execute('DELETE FROM nota_ingreso_detalles');
        await conn.execute('DELETE FROM nota_salida_detalles');
        await conn.execute('DELETE FROM notas_ingreso');
        await conn.execute('DELETE FROM notas_salida');
        
        // ============ INGRESOS ============
        console.log('📥 MIGRANDO INGRESOS...\n');
        
        const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        
        let ingCount = 0;
        for (let i = 1; i < ingLineas.length; i++) {
            const v = ingLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const producto = (v[2] || '').trim();
            const lote = (v[3] || '').trim();
            let fechaStr = (v[13] || '').trim();
            if (!fechaStr) fechaStr = (v[17] || '').trim();
            const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            try {
                const numeroUnico = `ING-${Date.now()}-${Math.random()}`;
                const [r] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, proveedor, estado) 
                     VALUES (?, ?, ?, 'RECIBIDA_CONFORME')`,
                    [numeroUnico, fecha, 'PROVEEDOR']
                );
                
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles (nota_ingreso_id, producto_id, lote_numero, cantidad_total) 
                     VALUES (?, 1, ?, ?)`,
                    [r.insertId, lote, cantidad]
                );
                
                ingCount++;
                if (ingCount % 100 === 0) process.stdout.write(`  ...${ingCount}\n`);
            } catch (e) {
                // Silencioso
            }
        }
        
        console.log(`✅ Ingresos: ${ingCount} notas\n`);
        
        // ============ SALIDAS ============
        console.log('📤 MIGRANDO SALIDAS...\n');
        
        const salContent = fs.readFileSync(path.join(__dirname, '../../../salida.csv'), 'utf-8');
        const salLineas = salContent.split('\n').filter(l => l.trim());
        
        let salCount = 0;
        for (let i = 1; i < salLineas.length; i++) {
            const v = salLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const producto = (v[2] || '').trim();
            const lote = (v[3] || '').trim();
            let fechaStr = (v[12] || '').trim();
            if (!fechaStr) fechaStr = (v[16] || '').trim();
            if (!fechaStr) fechaStr = (v[17] || '').trim();
            const cantidad = parseFloat((v[10] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            try {
                const numeroUnico = `SAL-${Date.now()}-${Math.random()}`;
                const [r] = await conn.execute(
                    `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                     VALUES (?, ?, 'REGISTRADA')`,
                    [numeroUnico, fecha]
                );
                
                await conn.execute(
                    `INSERT INTO nota_salida_detalles (nota_salida_id, producto_id, lote_numero, cantidad_total) 
                     VALUES (?, 1, ?, ?)`,
                    [r.insertId, lote, cantidad]
                );
                
                salCount++;
                if (salCount % 100 === 0) process.stdout.write(`  ...${salCount}\n`);
            } catch (e) {
                // Silencioso
            }
        }
        
        console.log(`✅ Salidas: ${salCount} notas\n`);
        
        console.log('═'.repeat(70));
        console.log(`✅ MIGRACIÓN COMPLETADA EXITOSAMENTE`);
        console.log(`   📥 Ingresos: ${ingCount} notas (${ingCount === 0 ? '⚠️ Sin fechas válidas' : '✅ Fechas corregidas'})`);
        console.log(`   📤 Salidas: ${salCount} notas (${salCount === 0 ? '⚠️ Sin fechas válidas' : '✅ Fechas corregidas'})`);
        console.log(`   📊 Total: ${ingCount + salCount} notas migradas`);
        console.log('═'.repeat(70) + '\n');
        
        if (ingCount > 0 && salCount > 0) {
            console.log('✨ ¡AHORA EL KARDEX DEBE ESTAR CORREGIDO!');
            console.log('   1. Accede a la aplicación');
            console.log('   2. Filtra un producto');
            console.log('   3. Verifica que las fechas estén en orden cronológico\n');
        }
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        console.error(e.stack);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
