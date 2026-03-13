/**
 * Agregar columnas faltantes a las tablas de detalles
 * para que devuelvan toda la información que el frontend espera
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🔧 AGREGAR COLUMNAS FALTANTES');
console.log('═'.repeat(70) + '\n');

async function agregarColumnas() {
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
        
        // Agregar columnas a nota_ingreso_detalles
        console.log('📝 Agregando columnas a nota_ingreso_detalles...\n');
        
        const columnasIngreso = [
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN fecha_vencimiento DATE NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN um VARCHAR(50) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN fabricante VARCHAR(200) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN temperatura_min_c DECIMAL(5,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN temperatura_max_c DECIMAL(5,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN cantidad_bultos DECIMAL(10,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN cantidad_cajas DECIMAL(10,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN cantidad_por_caja DECIMAL(10,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN cantidad_fraccion DECIMAL(10,2) NULL;',
            'ALTER TABLE nota_ingreso_detalles ADD COLUMN cantidad_total DECIMAL(10,2) NULL;'
        ];
        
        for (const sql of columnasIngreso) {
            try {
                await conn.execute(sql);
                console.log(`✅ ${sql.substring(0, 60)}...`);
            } catch (e) {
                if (e.message.includes('Duplicate column')) {
                    console.log(`ℹ️  Columna ya existe: ${sql.substring(40, 70)}`);
                } else {
                    console.error(`❌ Error: ${e.message}`);
                }
            }
        }
        
        // Agregar columnas a nota_salida_detalles
        console.log('\n📝 Agregando columnas a nota_salida_detalles...\n');
        
        const columnasSalida = [
            'ALTER TABLE nota_salida_detalles ADD COLUMN fecha_vencimiento DATE NULL;',
            'ALTER TABLE nota_salida_detalles ADD COLUMN um VARCHAR(50) NULL;',
            'ALTER TABLE nota_salida_detalles ADD COLUMN fabricante VARCHAR(200) NULL;',
            'ALTER TABLE nota_salida_detalles ADD COLUMN temperatura_min_c DECIMAL(5,2) NULL;',
            'ALTER TABLE nota_salida_detalles ADD COLUMN temperatura_max_c DECIMAL(5,2) NULL;',
            'ALTER TABLE nota_salida_detalles ADD COLUMN cantidad_total DECIMAL(10,2) NULL;'
        ];
        
        for (const sql of columnasSalida) {
            try {
                await conn.execute(sql);
                console.log(`✅ ${sql.substring(0, 60)}...`);
            } catch (e) {
                if (e.message.includes('Duplicate column')) {
                    console.log(`ℹ️  Columna ya existe: ${sql.substring(40, 70)}`);
                } else {
                    console.error(`❌ Error: ${e.message}`);
                }
            }
        }
        
        // Agregar columnas a productos si faltan
        console.log('\n📝 Agregando columnas a productos...\n');
        
        const columnasProductos = [
            'ALTER TABLE productos ADD COLUMN temperatura_min_c DECIMAL(5,2) NULL;',
            'ALTER TABLE productos ADD COLUMN temperatura_max_c DECIMAL(5,2) NULL;',
            'ALTER TABLE productos ADD COLUMN unidad_medida VARCHAR(50) NULL;'
        ];
        
        for (const sql of columnasProductos) {
            try {
                await conn.execute(sql);
                console.log(`✅ ${sql.substring(0, 60)}...`);
            } catch (e) {
                if (e.message.includes('Duplicate column')) {
                    console.log(`ℹ️  Columna ya existe: ${sql.substring(40, 70)}`);
                } else {
                    console.error(`❌ Error: ${e.message}`);
                }
            }
        }
        
        console.log('\n═'.repeat(70));
        console.log('✅ COLUMNAS AGREGADAS CORRECTAMENTE');
        console.log('═'.repeat(70) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

agregarColumnas();
