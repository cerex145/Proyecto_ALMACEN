/**
 * MIGRACIÓN FINAL - VERSION 3
 * Incluye proveedor en INSERT
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN FINAL V3 - DATOS CORREGIDOS');
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
        try {
            await conn.execute('DELETE FROM nota_ingreso_detalles WHERE 1=1');
            await conn.execute('DELETE FROM nota_salida_detalles WHERE 1=1');
            await conn.execute('DELETE FROM notas_ingreso WHERE 1=1');
            await conn.execute('DELETE FROM notas_salida WHERE 1=1');
        } catch (e) {}
        
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
                const [r] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, proveedor, estado) 
                     VALUES (?, ?, ?, 'RECIBIDA_CONFORME')`,
                    [`ING-${i}`, fecha, 'PROVEEDOR']
                );
                
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles (nota_ingreso_id, producto_id, lote_numero, cantidad_total) 
                     VALUES (?, 1, ?, ?)`,
                    [r.insertId, lote, cantidad]
                );
                
                ingCount++;
                if (ingCount % 200 === 0) process.stdout.write(`  ...${ingCount}\n`);
            } catch (e) {
                // Silencioso en errores
            }
        }
        
        console.log(`✅ Ingresos: ${ingCount} notas migradas\n`);
        
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
                const [r] = await conn.execute(
                    `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                     VALUES (?, ?, 'REGISTRADA')`,
                    [`SAL-${i}`, fecha]
                );
                
                await conn.execute(
                    `INSERT INTO nota_salida_detalles (nota_salida_id, producto_id, lote_numero, cantidad_total) 
                     VALUES (?, 1, ?, ?)`,
                    [r.insertId, lote, cantidad]
                );
                
                salCount++;
                if (salCount % 200 === 0) process.stdout.write(`  ...${salCount}\n`);
            } catch (e) {
                // Silencioso en errores
            }
        }
        
        console.log(`✅ Salidas: ${salCount} notas migradas\n`);
        
        console.log('═'.repeat(70));
        console.log(`✅ MIGRACIÓN COMPLETADA`);
        console.log(`   📥 Ingresos: ${ingCount} notas`);
        console.log(`   📤 Salidas: ${salCount} notas`);
        console.log(`   📊 Total: ${ingCount + salCount} notas`);
        console.log('═'.repeat(70) + '\n');
        
        console.log('✨ Próximos pasos:');
        console.log('   1. Iniciar servidor: npm run dev');
        console.log('   2. Acceder a aplicación');
        console.log('   3. Filtrar un producto en Kardex');
        console.log('   4. Verificar que las fechas están en orden cronológico\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        console.error(e.stack);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
