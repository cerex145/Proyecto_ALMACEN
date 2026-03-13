/**
 * MIGRACIÓN CON LOG EXTREMO PARA SABER POR QUÉ DA 0
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

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
        
        const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        
        console.log(`\nTotal ingLineas: ${ingLineas.length}`);
        console.log(`Tipo: ${typeof ingLineas}`);
        console.log(`Length: ${ingLineas.length}\n`);
        
        let contadorBloque = 0;
        let contadorSaltadas = 0;
        let contadorFechas = 0;
        let contadorInserts = 0;
        
        for (let i = 1; i < Math.min(50, ingLineas.length); i++) {
            contadorBloque++;
            
            const v = ingLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
            let fechaStr = (v[13] || '').trim();
            
            if (!fechaStr) {
                fechaStr = (v[17] || '').trim();
            }
            
            if (!codProd || !fechaStr || cantidad === 0) {
                contadorSaltadas++;
                if (i <= 5) {
                    console.log(`[${i}] SALTADA: codProd="${codProd}", fechaStr="${fechaStr}", cant=${cantidad}`);
                }
                continue;
            }
            
            const fecha = parseFecha(fechaStr);
            
            if (!fecha) {
                console.log(`[${i}] Fecha inválida: "${fechaStr}"`);
                continue;
            }
            
            contadorFechas++;
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, proveedor, estado) VALUES (?, ?, ?, 'RECIBIDA_CONFORME')`,
                    [`ING-${i}`, fecha, 'PROVEEDOR']
                );
                
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles (nota_ingreso_id, producto_id, lote_numero, cantidad_total) VALUES (?, 1, ?, ?)`,
                    [r.insertId, 'LOTE', cantidad]
                );
                
                contadorInserts++;
                if (i <= 5) {
                    console.log(`[${i}] ✅ INSERTADA: ${codProd} - ${fecha} - ${cantidad}`);
                }
            } catch (e) {
                console.log(`[${i}] ERROR INSERT:`, e.message);
            }
        }
        
        console.log(`\n📊 Resumen primeras 50 líneas:`);
        console.log(`   Procesadas: ${contadorBloque}`);
        console.log(`   Saltadas: ${contadorSaltadas}`);
        console.log(`   Con fecha válida: ${contadorFechas}`);
        console.log(`   Insertadas: ${contadorInserts}\n`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        console.error(e.stack);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
