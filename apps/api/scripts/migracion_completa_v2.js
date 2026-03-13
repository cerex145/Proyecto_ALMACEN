/**
 * MIGRACIÓN COMPLETA - VERSION 2
 * Usa índices fijos de columnas (sin depender de headers exactos)
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN COMPLETA DE DATOS CORREGIDOS (V2)');
console.log('═'.repeat(70) + '\n');

const ingresoCsvPath = path.join(__dirname, '../../../ingreso.csv');
const salidaCsvPath = path.join(__dirname, '../../../salida.csv');

if (!fs.existsSync(ingresoCsvPath) || !fs.existsSync(salidaCsvPath)) {
    console.error('❌ Archivos CSV no encontrados');
    process.exit(1);
}

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
        
        console.log('✅ Conectado a BD\n');
        
        // ============= INGRESOS =============
        console.log('📥 PROCESANDO INGRESOS...\n');
        
        const ingContent = fs.readFileSync(ingresoCsvPath, 'utf-8');
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        
        let ingCreados = 0, ingDetall = 0, ingErr = 0;
        
        const ingMap = {};
        for (let i = 1; i < ingLineas.length; i++) {
            const v = ingLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const producto = (v[2] || '').trim();
            const lote = (v[3] || '').trim();
            const fechaStr = (v[13] || '').trim(); // Fecha de H_Ingreso
            const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            const key = `${codProd}|${lote}|${fecha}`;
            if (!ingMap[key]) {
                ingMap[key] = { codProd, producto, lote, fecha, cantidad: 0 };
            }
            ingMap[key].cantidad += cantidad;
        }
        
        for (const key in ingMap) {
            try {
                const ing = ingMap[key];
                const [r1] = await conn.execute(
                    'INSERT INTO nota_ingreso (fecha_ingreso, ruc_proveedor) VALUES (?, ?)',
                    [ing.fecha, '20000000000']
                );
                
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles 
                    (nota_ingreso_id, codigo_producto, producto, lote, cantidad_total)
                    VALUES (?, ?, ?, ?, ?)`,
                    [r1.insertId, ing.codProd, ing.producto, ing.lote, ing.cantidad]
                );
                
                ingCreados++;
                ingDetall++;
            } catch (e) {
                ingErr++;
            }
        }
        
        console.log(`✅ Ingresos: ${ingCreados} notas | Detalles: ${ingDetall} | Errores: ${ingErr}\n`);
        
        // ============= SALIDAS =============
        console.log('📤 PROCESANDO SALIDAS...\n');
        
        const salContent = fs.readFileSync(salidaCsvPath, 'utf-8');
        const salLineas = salContent.split('\n').filter(l => l.trim());
        
        let salCreadas = 0, salDetall = 0, salErr = 0;
        
        const salMap = {};
        for (let i = 1; i < salLineas.length; i++) {
            const v = salLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const producto = (v[2] || '').trim();
            const lote = (v[3] || '').trim();
            const fechaStr = (v[12] || '').trim(); // Fecha de H_Salida
            const motivo = (v[11] || 'VENTA').trim();
            const cantidad = parseFloat((v[10] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            const key = `${codProd}|${lote}|${fecha}`;
            if (!salMap[key]) {
                salMap[key] = { codProd, producto, lote, fecha, cantidad: 0, motivo };
            }
            salMap[key].cantidad += cantidad;
        }
        
        for (const key in salMap) {
            try {
                const sal = salMap[key];
                const [r1] = await conn.execute(
                    'INSERT INTO nota_salida (fecha_salida, motivo) VALUES (?, ?)',
                    [sal.fecha, sal.motivo]
                );
                
                await conn.execute(
                    `INSERT INTO nota_salida_detalles 
                    (nota_salida_id, codigo_producto, producto, lote, cantidad_total)
                    VALUES (?, ?, ?, ?, ?)`,
                    [r1.insertId, sal.codProd, sal.producto, sal.lote, sal.cantidad]
                );
                
                salCreadas++;
                salDetall++;
            } catch (e) {
                salErr++;
            }
        }
        
        console.log(`✅ Salidas: ${salCreadas} notas | Detalles: ${salDetall} | Errores: ${salErr}\n`);
        
        console.log('═'.repeat(70));
        console.log(`✅ MIGRACIÓN COMPLETADA`);
        console.log(`   Total: ${ingCreados + salCreadas} notas | ${ingDetall + salDetall} detalles`);
        console.log('═'.repeat(70) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
