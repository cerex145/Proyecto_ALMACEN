/**
 * MIGRACIÓN CORREGIDA - Parser robusto para CSV con líneas en blanco
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(80));
console.log('🚀 MIGRACIÓN CORREGIDA - Parser robusto');
console.log('═'.repeat(80) + '\n');

function parseFecha(str) {
    if (!str || str.trim() === '' || str.trim() === 'N/A') return null;
    const match = str.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return null;
    const [, d, m, y] = match.map(Number);
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > 2099) return null;
    const fecha = new Date(y, m - 1, d);
    return fecha.toISOString().split('T')[0];
}

function parseTemperatura(str) {
    if (!str || str.trim() === '' || str.trim() === '-' || str.trim() === 'N/A') return { min: null, max: null };
    const match = str.trim().match(/(\d+)[^\d]*(\d+)/);
    if (!match) return { min: null, max: null };
    return { 
        min: parseFloat(match[1]) || null,
        max: parseFloat(match[2]) || null
    };
}

function parseNumero(str) {
    if (!str || str.trim() === '' || str.trim() === '-' || str.trim() === 'N/A') return null;
    const num = parseFloat(str.trim().replace(',', '.'));
    return isNaN(num) ? null : num;
}

// Parse CSV eliminando líneas vacías
function parseCSV(content) {
    // Primero, separar por líneas pero mantener track de si están entrecomillas
    const lines = content.split('\n');
    const records = [];
    let currentRecord = '';
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue; // Ignorar líneas vacías
        
        currentRecord += (currentRecord ? '\n' : '') + line;
        // Si la línea contiene ;, probablemente sea un nuevo registro
        if (line.includes(';')) {
            records.push(currentRecord);
            currentRecord = '';
        }
    }
    if (currentRecord) records.push(currentRecord);
    
    // Ahora parse cada registro
    return records.map(r => r.split(';').map(v => v.trim()));
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
        
        // ============ LIMPIAR DATOS PREVIOS ============
        console.log('🗑️  Limpiando detalles previos...\n');
        
        try {
            await conn.execute('DELETE FROM nota_ingreso_detalles');
            await conn.execute('DELETE FROM nota_salida_detalles');
            console.log('✅ Limpieza completada\n');
        } catch (e) {
            console.log('⚠️  Algunas tablas pueden estar vacías\n');
        }
        
        // ============ INGRESOS ============
        console.log('📥 MIGRANDO INGRESOS...\n');
        
        const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
        const ingRecords = parseCSV(ingContent);
        
        let ingCreadas = 0;
        let ingErrors = 0;
        
        for (let i = 1; i < ingRecords.length; i++) {
            try {
                const v = ingRecords[i];
                if (v.length < 13) {
                    ingErrors++;
                    continue;
                }
                
                const codProd = v[1] || '';
                const lote = v[3] || '';
                const fechaVctoStr = v[4] || '';
                const um = v[5] || '';
                const fabricante = v[6] || '';
                const tempStr = v[7] || '';
                const cantBulto = parseNumero(v[8]);
                const cantCajas = parseNumero(v[9]);
                const cantPorCaja = parseNumero(v[10]);
                const cantFraccion = parseNumero(v[11]);
                const cantTotal = parseNumero(v[12]);
                const fechaIngresoStr = v[13] || '';
                
                // Validaciones
                if (!codProd || !fabricante || !cantTotal || cantTotal === 0) {
                    ingErrors++;
                    continue;
                }
                
                const fechaIngreso = parseFecha(fechaIngresoStr);
                const fechaVcto = parseFecha(fechaVctoStr);
                const temp = parseTemperatura(tempStr);
                
                if (!fechaIngreso) {
                    ingErrors++;
                    continue;
                }
                
                // Buscar ID del producto
                const [productos] = await conn.execute(
                    `SELECT id FROM productos WHERE codigo = ? LIMIT 1`,
                    [codProd]
                );
                
                if (productos.length === 0) {
                    ingErrors++;
                    continue;
                }
                
                const prodId = productos[0].id;
                
                // Crear nota de ingreso
                const numero = `ING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const [result] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, estado) 
                    VALUES (?, ?, 'REGISTRADA')`,
                    [numero, fechaIngreso]
                );
                const notaId = result.insertId;
                
                // Insertar detalle
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles 
                    (nota_ingreso_id, producto_id, lote_numero, cantidad, 
                     fecha_vencimiento, um, fabricante, temperatura_min_c, temperatura_max_c,
                     cantidad_bultos, cantidad_cajas, cantidad_por_caja, cantidad_fraccion, cantidad_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notaId, prodId, lote, cantTotal,
                     fechaVcto, um, fabricante, temp.min, temp.max,
                     cantBulto, cantCajas, cantPorCaja, cantFraccion, cantTotal]
                );
                
                ingCreadas++;
            } catch (e) {
                ingErrors++;
                if (i <= 5) console.log(`  ⚠️  Fila ${i}: ${e.message}`);
            }
        }
        
        console.log(`✅ Ingresos: ${ingCreadas} registros migrados, ${ingErrors} errores\n`);
        
        // ============ SALIDAS ============
        console.log('📤 MIGRANDO SALIDAS...\n');
        
        const salContent = fs.readFileSync(path.join(__dirname, '../../../salida.csv'), 'utf-8');
        const salRecords = parseCSV(salContent);
        
        let salCreadas = 0;
        let salErrors = 0;
        
        for (let i = 1; i < salRecords.length; i++) {
            try {
                const v = salRecords[i];
                if (v.length < 12) {
                    salErrors++;
                    continue;
                }
                
                const codProd = v[1] || '';
                const lote = v[3] || '';
                const fechaVctoStr = v[4] || '';
                const um = v[5] || '';
                const cantBulto = parseNumero(v[6]);
                const cantCajas = parseNumero(v[7]);
                const cantPorCaja = parseNumero(v[8]);
                const cantFraccion = parseNumero(v[9]);
                const cantTotal = parseNumero(v[10]);
                const fechaSalidaStr = v[12] || '';
                
                if (!codProd || !cantTotal || cantTotal === 0) {
                    salErrors++;
                    continue;
                }
                
                const fechaSalida = parseFecha(fechaSalidaStr);
                const fechaVcto = parseFecha(fechaVctoStr);
                
                if (!fechaSalida) {
                    salErrors++;
                    continue;
                }
                
                // Buscar ID del producto
                const [productos] = await conn.execute(
                    `SELECT id, fabricante FROM productos WHERE codigo = ? LIMIT 1`,
                    [codProd]
                );
                
                if (productos.length === 0) {
                    salErrors++;
                    continue;
                }
                
                const prodId = productos[0].id;
                const fabricante = productos[0].fabricante || '';
                
                // Crear nota de salida
                const numero = `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const [result] = await conn.execute(
                    `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                    VALUES (?, ?, 'REGISTRADA')`,
                    [numero, fechaSalida]
                );
                const notaId = result.insertId;
                
                // Insertar detalle con TODOS los campos igual que ingresos
                await conn.execute(
                    `INSERT INTO nota_salida_detalles 
                    (nota_salida_id, producto_id, lote_numero, cantidad, 
                     fecha_vencimiento, um, fabricante, cantidad_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notaId, prodId, lote, cantTotal,
                     fechaVcto, um, fabricante, cantTotal]
                );
                
                salCreadas++;
            } catch (e) {
                salErrors++;
                if (i <= 5) console.log(`  ⚠️  Fila ${i}: ${e.message}`);
            }
        }
        
        console.log(`✅ Salidas: ${salCreadas} registros migrados, ${salErrors} errores\n`);
        
        console.log('═'.repeat(80));
        console.log(`✅ MIGRACIÓN COMPLETADA`);
        console.log(`   Ingresos: ${ingCreadas} | Salidas: ${salCreadas}`);
        console.log(`   Total: ${ingCreadas + salCreadas} registros`);
        console.log('═'.repeat(80) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
