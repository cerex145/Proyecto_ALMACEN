/**
 * MIGRACIÓN COMPLETA v7 - CON DATOS CORRECTOS DE PRODUCTOS
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN v7 - CORRIGIENDO ÍNDICES DE COLUMNAS');
console.log('═'.repeat(70) + '\n');

const projectRoot = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN';
const prodFile = path.join(projectRoot, 'Productos.csv');
const ingFile = path.join(projectRoot, 'ingreso.csv');
const salFile = path.join(projectRoot, 'salida.csv');

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
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: 'root123',
            database: 'almacen_db'
        });
        
        console.log('✅ Conectado a BD\n');
        
        // ============ PRODUCTOS ============
        console.log('📦 REACTUALIZANDO PRODUCTOS CON ÍNDICES CORRECTOS...\n');
        
        let prodContent = fs.readFileSync(prodFile, 'utf-8');
        if (prodContent.charCodeAt(0) === 0xfeff) {
            prodContent = prodContent.slice(1);
        }
        
        const prodLineas = prodContent.split('\n').filter(l => l.trim());
        let prodCount = 0;
        
        console.log(`  Total de líneas en Productos.csv: ${prodLineas.length}`);
        
        // Debug: mostrar estructura correcta
        if (prodLineas.length > 1) {
            const v = prodLineas[1].split(';');
            console.log(`\n📋 Estructura CSV (primeros 25 campos):`);
            for (let i = 0; i < Math.min(25, v.length); i++) {
                const val = v[i] ? v[i].substring(0, 25) : 'VACIO';
                console.log(`  [${i}] = "${val}"`);
            }
            console.log('');
        }
        
        for (let i = 1; i < prodLineas.length; i++) {
            const v = prodLineas[i].split(';');
            const codProd = (v[1] || '').trim();  // [1] = Cod. Producto
            const nombre = (v[2] || '').trim();  // [2] = Producto
            const lote = (v[3] || '').trim();  // [3] = Lote
            const regSanitario = (v[4] || '').trim();  // [4] = Registro Sanitario
            const proveedor = (v[7] || '').trim();  // [7] = Proveedor
            const tipoDoc = (v[11] || '').trim();  // [11] = T. Documento
            const numDoc = (v[12] || '').trim();  // [12] = N° de Documento
            const fabricante = (v[22] || '').trim();  // [22] = Fabricante (CORREGIDO)
            const procedencia = (v[23] || '').trim();  // [23] = Procedencia (CORREGIDO)
            const fechaIngreso = parseFecha(v[9] || '');  // [9] = Fecha Ingreso
            
            if (!codProd || !nombre) continue;
            
            if (i <= 5 || i % 300 === 0) {
                console.log(`  Línea ${i}: "${codProd}" - Lote:"${lote}" - Prov:"${proveedor}" - Fab:"${fabricante}"`);
               }
            
            try {
                await conn.execute(
                    `UPDATE productos 
                     SET lote=?, numero_documento=?, tipo_documento=?, fabricante=?, procedencia=?, proveedor=?, registro_sanitario=?, fecha_documento=?
                     WHERE codigo=?`,
                    [
                        lote || null, 
                        numDoc || null,
                        tipoDoc || null,
                        fabricante || null,
                        procedencia || null,
                        proveedor || null,
                        regSanitario || null,
                        fechaIngreso || null,
                        codProd
                    ]
                );
                prodCount++;
                if (prodCount % 200 === 0) process.stdout.write(`  ...${prodCount}\n`);
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error: ${e.message.substring(0, 80)}`);
                }
            }
        }
        
        console.log(`\n✅ Productos: ${prodCount} productos actualizados\n`);
        
        console.log('═'.repeat(70));
        console.log('✅ REACUALIZACIÓN COMPLETADA');
        console.log('═'.repeat(70));
        console.log(`\n📊 Resumen:\n  • ${prodCount} productos actualizados con datos correctos\n`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
