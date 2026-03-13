/**
 * MIGRACIÓN COMPLETA DE INGRESOS Y SALIDAS
 * Usa los CSVs corregidos: ingreso.csv y salida.csv
 * 
 * Uso: node migracion_completa.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN COMPLETA DE DATOS CORREGIDOS');
console.log('═'.repeat(70) + '\n');

// Verificar que los CSVs existan
const ingresoCsvPath = path.join(__dirname, '../../../ingreso.csv');
const salidaCsvPath = path.join(__dirname, '../../../salida.csv');

if (!fs.existsSync(ingresoCsvPath)) {
    console.error(`❌ No se encontró: ${ingresoCsvPath}`);
    process.exit(1);
}

if (!fs.existsSync(salidaCsvPath)) {
    console.error(`❌ No se encontró: ${salidaCsvPath}`);
    process.exit(1);
}

console.log('✅ Archivos CSV encontrados:');
console.log(`   - ${ingresoCsvPath}`);
console.log(`   - ${salidaCsvPath}\n`);

// Crear conexión a BD
const mysql = require('mysql2/promise');

async function migracionCompleta() {
    let connection;
    
    try {
        console.log(`📡 Conectando a: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conexión establecida\n');
        
        // ============ MIGRAR INGRESOS ============
        console.log('📥 MIGRANDO INGRESOS...\n');
        
        const ingresosContent = fs.readFileSync(ingresoCsvPath, 'utf-8');
        const ingresosLineas = ingresosContent.split('\n').filter(l => l.trim());
        const ingresosHeaders = ingresosLineas[0].split(';').map(h => h.trim());
        
        let ingresosCreados = 0;
        let ingresosDetalles = 0;
        let ingresosError = 0;
        
        // Mapeo de columnas (basado en lo que vimos)
        const colIng = {
            codProducto: ingresosHeaders.indexOf('Cod. Producto'),
            producto: ingresosHeaders.indexOf('Producto'),
            lote: ingresosHeaders.indexOf('Lote'),
            fechaIngreso: ingresosHeaders.indexOf('Fecha de H_Ingreso'),
            cantBulto: ingresosHeaders.indexOf('Cant.Bulto'),
            cantCajas: ingresosHeaders.indexOf('Cant.Cajas'),
            cantPorCaja: ingresosHeaders.indexOf('Cant.x Caja'),
            cantFraccion: ingresosHeaders.indexOf('Cant.Fracción'),
            cantTotal: ingresosHeaders.indexOf('Cant.Total_Ingreso'),
            ruc: ingresosHeaders.indexOf('RUC')
        };
        
        // Procesar ingresos
        const ingresosMap = {};
        
        for (let i = 1; i < ingresosLineas.length; i++) {
            const valores = ingresosLineas[i].split(';').map(v => v.trim());
            
            const codProd = valores[colIng.codProducto] || '';
            const fechaStr = valores[colIng.fechaIngreso] || '';
            const lote = valores[colIng.lote] || '';
            const cantidad = parseFloat(valores[colIng.cantTotal] || 0);
            
            if (!codProd || !fechaStr) continue; // Saltar líneas incompletas
            
            // Validar fecha DD/MM/YYYY
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaStr)) continue;
            
            try {
                const [dia, mes, anio] = fechaStr.split('/').map(Number);
                const fecha = new Date(anio, mes - 1, dia).toISOString().split('T')[0];
                
                const key = `${codProd}|${lote}|${fecha}`;
                if (!ingresosMap[key]) {
                    ingresosMap[key] = { producto: valores[colIng.producto], cantidad: 0, fecha, lote, codProd };
                }
                ingresosMap[key].cantidad += cantidad;
            } catch (e) {
                ingresosError++;
            }
        }
        
        // Insertar ingresos
        for (const key in ingresosMap) {
            const ing = ingresosMap[key];
            try {
                const [result] = await connection.execute(
                    'INSERT INTO nota_ingreso (fecha_ingreso, ruc_proveedor) VALUES (?, ?)',
                    [ing.fecha, '20000000000']
                );
                
                const notaId = result.insertId;
                
                await connection.execute(
                    `INSERT INTO nota_ingreso_detalles 
                    (nota_ingreso_id, codigo_producto, producto, lote, cantidad_total, cantidad_bultos, 
                     cantidad_cajas, cantidad_por_caja, cantidad_fraccion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notaId, ing.codProd, ing.producto, ing.lote, ing.cantidad, 0, 0, ing.cantidad, 0]
                );
                
                ingresosCreados++;
                ingresosDetalles++;
            } catch (e) {
                ingresosError++;
            }
        }
        
        console.log(`✅ Ingresos migrados:`);
        console.log(`   - Notas: ${ingresosCreados}`);
        console.log(`   - Detalles: ${ingresosDetalles}`);
        console.log(`   - Errores: ${ingresosError}\n`);
        
        // ============ MIGRAR SALIDAS ============
        console.log('📤 MIGRANDO SALIDAS...\n');
        
        const salidasContent = fs.readFileSync(salidaCsvPath, 'utf-8');
        const salidasLineas = salidasContent.split('\n').filter(l => l.trim());
        const salidasHeaders = salidasLineas[0].split(';').map(h => h.trim());
        
        let salidasCreadas = 0;
        let salidasDetalles = 0;
        let salidasError = 0;
        
        // Mapeo de columnas
        const colSal = {
            codProducto: salidasHeaders.indexOf('Cod. Producto'),
            producto: salidasHeaders.indexOf('Producto'),
            lote: salidasHeaders.indexOf('Lote'),
            fechaSalida: salidasHeaders.indexOf('Fecha de H_Salida'),
            motivo: salidasHeaders.indexOf('Motivo de Salida'),
            cantBulto: salidasHeaders.indexOf('Cant.Bulto'),
            cantCajas: salidasHeaders.indexOf('Cant.Cajas'),
            cantPorCaja: salidasHeaders.indexOf('Cant.x Caja'),
            cantFraccion: salidasHeaders.indexOf('Cant.Fracción'),
            cantTotal: salidasHeaders.indexOf('Cant.Total_Salida'),
            ruc: salidasHeaders.indexOf('RUC')
        };
        
        // Procesar salidas
        const salidasMap = {};
        
        for (let i = 1; i < salidasLineas.length; i++) {
            const valores = salidasLineas[i].split(';').map(v => v.trim());
            
            const codProd = valores[colSal.codProducto] || '';
            const fechaStr = valores[colSal.fechaSalida] || '';
            const lote = valores[colSal.lote] || '';
            const cantidad = parseFloat(valores[colSal.cantTotal] || 0);
            
            if (!codProd || !fechaStr) continue; // Saltar líneas incompletas
            
            // Validar fecha DD/MM/YYYY
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fechaStr)) continue;
            
            try {
                const [dia, mes, anio] = fechaStr.split('/').map(Number);
                const fecha = new Date(anio, mes - 1, dia).toISOString().split('T')[0];
                
                const key = `${codProd}|${lote}|${fecha}`;
                if (!salidasMap[key]) {
                    salidasMap[key] = { 
                        producto: valores[colSal.producto], 
                        cantidad: 0, 
                        fecha, 
                        lote, 
                        codProd,
                        motivo: valores[colSal.motivo] || 'VENTA'
                    };
                }
                salidasMap[key].cantidad += cantidad;
            } catch (e) {
                salidasError++;
            }
        }
        
        // Insertar salidas
        for (const key in salidasMap) {
            const sal = salidasMap[key];
            try {
                const [result] = await connection.execute(
                    'INSERT INTO nota_salida (fecha_salida, motivo) VALUES (?, ?)',
                    [sal.fecha, sal.motivo]
                );
                
                const notaId = result.insertId;
                
                await connection.execute(
                    `INSERT INTO nota_salida_detalles 
                    (nota_salida_id, codigo_producto, producto, lote, cantidad_total, cantidad_bultos,
                     cantidad_cajas, cantidad_por_caja, cantidad_fraccion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [notaId, sal.codProd, sal.producto, sal.lote, sal.cantidad, 0, 0, sal.cantidad, 0]
                );
                
                salidasCreadas++;
                salidasDetalles++;
            } catch (e) {
                salidasError++;
            }
        }
        
        console.log(`✅ Salidas migradas:`);
        console.log(`   - Notas: ${salidasCreadas}`);
        console.log(`   - Detalles: ${salidasDetalles}`);
        console.log(`   - Errores: ${salidasError}\n`);
        
        // Resumen final
        console.log('═'.repeat(70));
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('═'.repeat(70));
        console.log(`\n✅ Ingresos: ${ingresosCreados} notas creadas`);
        console.log(`✅ Salidas: ${salidasCreadas} notas creadas`);
        console.log(`✅ Total detalles: ${ingresosDetalles + salidasDetalles}`);
        console.log(`\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n`);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar
migracionCompleta();
