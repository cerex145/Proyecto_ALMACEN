/**
 * MIGRACIÓN COMPLETA DE INGRESOS Y SALIDAS
 * Con TODOS los campos que el frontend espera
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(80));
console.log('🚀 MIGRACIÓN COMPLETA - TODOS LOS CAMPOS');
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
    if (!str || str.trim() === '' || str.trim() === '-') return { min: null, max: null };
    // Ej: "15ª 25ª C" => min: 15, max: 25
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
        console.log('📥 MIGRANDO INGRESOS CON TODOS LOS CAMPOS...\n');
        
        const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        
        if (ingLineas.length < 2) throw new Error('CSV de ingresos vacío');
        
        let ingCreadas = 0;
        let ingErrors = 0;
        
        for (let i = 1; i < ingLineas.length; i++) {
            try {
                const v = ingLineas[i].split(';').map(val => val.trim());
                
                const codProd = v[1] || '';
                const producto = v[2] || '';
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
                
                // Buscar o crear nota de ingreso
                const [notasExistentes] = await conn.execute(
                    `SELECT id FROM notas_ingreso WHERE fecha = ? LIMIT 1`,
                    [fechaIngreso]
                );
                
                let notaId;
                if (notasExistentes.length > 0) {
                    notaId = notasExistentes[0].id;
                } else {
                    const numero = `ING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const [result] = await conn.execute(
                        `INSERT INTO notas_ingreso (numero_ingreso, fecha, estado) 
                        VALUES (?, ?, 'REGISTRADA')`,
                        [numero, fechaIngreso]
                    );
                    notaId = result.insertId;
                }
                
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
        
        console.log(`✅ Ingresos: ${ingCreadas} registros migrados, ${ingErrors} errores/saltos\n`);
        
        // ============ SALIDAS ============
        console.log('📤 MIGRANDO SALIDAS CON TODOS LOS CAMPOS...\n');
        
        const salContent = fs.readFileSync(path.join(__dirname, '../../../salida.csv'), 'utf-8');
        const salLineas = salContent.split('\n').filter(l => l.trim());
        
        if (salLineas.length < 2) throw new Error('CSV de salidas vacío');
        
        let salCreadas = 0;
        let salErrors = 0;
        
        for (let i = 1; i < salLineas.length; i++) {
            try {
                const v = salLineas[i].split(';').map(val => val.trim());
                
                const codProd = v[1] || '';
                const producto = v[2] || '';
                const lote = v[3] || '';
                const fechaVctoStr = v[4] || '';
                const um = v[5] || '';
                const fabricante = v[6] || '';
                const tempStr = v[7] || '';
                const cantTotal = parseNumero(v[10]);
                const fechaSalidaStr = v[12] || '';
                
                if (!codProd || !cantTotal || cantTotal === 0) {
                    salErrors++;
                    continue;
                }
                
                const fechaSalida = parseFecha(fechaSalidaStr);
                const fechaVcto = parseFecha(fechaVctoStr);
                const temp = parseTemperatura(tempStr);
                
                if (!fechaSalida) {
                    salErrors++;
                    continue;
                }
                
                // Buscar ID del producto
                const [productos] = await conn.execute(
                    `SELECT id FROM productos WHERE codigo = ? LIMIT 1`,
                    [codProd]
                );
                
                if (productos.length === 0) {
                    salErrors++;
                    continue;
                }
                
                const prodId = productos[0].id;
                
                // Buscar o crear nota de salida
                const [notasExistentes] = await conn.execute(
                    `SELECT id FROM notas_salida WHERE fecha = ? LIMIT 1`,
                    [fechaSalida]
                );
                
                let notaId;
                if (notasExistentes.length > 0) {
                    notaId = notasExistentes[0].id;
                } else {
                    const numero = `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const [result] = await conn.execute(
                        `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                        VALUES (?, ?, 'REGISTRADA')`,
                        [numero, fechaSalida]
                    );
                    notaId = result.insertId;
                }
                
                // Insertar detalle
                await conn.execute(
                    `INSERT INTO nota_salida_detalles 
                    (nota_salida_id, producto_id, lote_numero, cantidad, 
                     fecha_vencimiento, um, fabricante, temperatura_min_c, temperatura_max_c, cantidad_total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notaId, prodId, lote, cantTotal,
                     fechaVcto, um, fabricante, temp.min, temp.max, cantTotal]
                );
                
                salCreadas++;
            } catch (e) {
                salErrors++;
                if (i <= 5) console.log(`  ⚠️  Fila ${i}: ${e.message}`);
            }
        }
        
        console.log(`✅ Salidas: ${salCreadas} registros migrados, ${salErrors} errores/saltos\n`);
        
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
