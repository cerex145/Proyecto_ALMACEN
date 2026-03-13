/**
 * MIGRACIÓN CON DEBUG DETALLADO
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n🔍 MIGRACIÓN CON DEBUG\n');

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
        
        console.log('✅ Conectado\n');
        
        // LIMPIAR
        try {
            await conn.execute('DELETE FROM nota_ingreso_detalles WHERE 1=1');
            await conn.execute('DELETE FROM nota_salida_detalles WHERE 1=1');
            await conn.execute('DELETE FROM notas_ingreso WHERE 1=1');
            await conn.execute('DELETE FROM notas_salida WHERE 1=1');
            console.log('✅ Limpieza completada\n');
        } catch (e) {
            console.log('⚠️  Error en limpieza:', e.message, '\n');
        }
        
        // ============ INGRESOS ============
        console.log('📥 INGRESOS...\n');
        
        const ingPath = path.join(__dirname, '../../../ingreso.csv');
        console.log('Path:', ingPath);
        console.log('Existe:', fs.existsSync(ingPath), '\n');
        
        const ingContent = fs.readFileSync(ingPath, 'utf-8');
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        
        console.log('Total líneas:', ingLineas.length);
        console.log(`Primeras 3 líneas (first 100 chars each):\n`);
        for (let i = 0; i < Math.min(3, ingLineas.length); i++) {
            console.log(`[${i}] ${ingLineas[i].substring(0, 100)}`);
        }
        console.log();
        
        let ingCount = 0;
        let ingSaltadas = 0;
        
        for (let i = 1; i < Math.min(10, ingLineas.length); i++) {
            const v = ingLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const producto = (v[2] || '').trim();
            const lote = (v[3] || '').trim();
            let fechaStr = (v[13] || '').trim();
            if (!fechaStr) fechaStr = (v[17] || '').trim();
            const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
            
            console.log(`Línea ${i}:`);
            console.log(`  codProd[1]: "${codProd}"`);
            console.log(`  fechaStr[13/17]: "${fechaStr}"`);
            console.log(`  cantidad[12]: ${cantidad}`);
            
            if (!codProd || !fechaStr || cantidad === 0) {
                console.log(`  ❌ SALTADA: ${!codProd ? 'sin codProd' : !fechaStr ? 'sin fecha' : 'sin cantidad'}`);
                ingSaltadas++;
                console.log();
                continue;
            }
            
            const fecha = parseFecha(fechaStr);
            console.log(`  fechaParsed: "${fecha}"`);
            
            if (!fecha) {
                console.log(`  ❌ SALTADA: fecha inválida`);
                ingSaltadas++;
                console.log();
                continue;
            }
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, estado) VALUES (?, ?, 'RECIBIDA_CONFORME')`,
                    [`ING-${i}`, fecha]
                );
                console.log(`  ✅ INSERTADA: ID=${r.insertId}`);
                ingCount++;
            } catch (e) {
                console.log(`  ❌ ERROR INSERT:`, e.message);
            }
            console.log();
        }
        
        console.log(`Resumen primeras 10 líneas: ${ingCount} insertadas, ${ingSaltadas} saltadas\n`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
