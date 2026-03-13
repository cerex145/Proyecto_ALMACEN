/**
 * MIGRACIÓN COMPLETA - SCHEMA NUEVO + DATOS
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN COMPLETA - SCHEMA NUEVO + DATOS');
console.log('═'.repeat(70) + '\n');

const projectRoot = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN';
const prodFile = path.join(projectRoot, 'Productos.csv');
const ingFile = path.join(projectRoot, 'ingreso.csv');
const salFile = path.join(projectRoot, 'salida.csv');

console.log('📁 Rutas:');
console.log(`  Productos: ${prodFile}`);
console.log(`  Ingresos:  ${ingFile}`);
console.log(`  Salidas:   ${salFile}\n`);

// Verificar que los archivos existen
if (!fs.existsSync(prodFile)) {
    console.error('❌ Error: Archivo Productos.csv no encontrado');
    process.exit(1);
}
if (!fs.existsSync(ingFile)) {
    console.error('❌ Error: Archivo ingreso.csv no encontrado');
    process.exit(1);
}
if (!fs.existsSync(salFile)) {
    console.error('❌ Error: Archivo salida.csv no encontrado');
    process.exit(1);
}

console.log('✅ Todos los archivos CSV encontrados\n');

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
        
        // ELIMINAR TODAS LAS TABLAS
        console.log('🗑️  Eliminando todas las tablas antiguas...\n');
        const [tables] = await conn.execute(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE='BASE TABLE'`
        );
        
        // Desactivar FK temporalmente
        await conn.execute('SET FOREIGN_KEY_CHECKS=0');
        
        for (const table of tables) {
            try {
                await conn.execute(`DROP TABLE ${table.TABLE_NAME}`);
                console.log(`  ✓ ${table.TABLE_NAME}`);
            } catch (e) {}
        }
        
        await conn.execute('SET FOREIGN_KEY_CHECKS=1');
        
        // CREAR SCHEMA NUEVO
        console.log('\n📋 Creando schema nuevo...\n');
        const schemaSql = `
CREATE TABLE clientes (
  id INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  razon_social VARCHAR(200) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE INDEX UK_clientes_codigo (codigo)
);

CREATE TABLE productos (
  id INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(300) NOT NULL,
  proveedor VARCHAR(200),
  fabricante VARCHAR(200),
  procedencia VARCHAR(200),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX UK_productos_codigo (codigo)
);

CREATE TABLE notas_ingreso (
  id INT NOT NULL AUTO_INCREMENT,
  numero_ingreso VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  proveedor VARCHAR(200),
  estado ENUM('REGISTRADA', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA_CONFORME', 'RECIBIDA_OBSERVADA') DEFAULT 'REGISTRADA',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX IDX_notas_ingreso_fecha (fecha)
);

CREATE TABLE nota_ingreso_detalles (
  id INT NOT NULL AUTO_INCREMENT,
  nota_ingreso_id INT NOT NULL,
  producto_id INT NOT NULL,
  lote_numero VARCHAR(100),
  cantidad DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  INDEX IDX_nota_ingreso_detalles_nota (nota_ingreso_id),
  FOREIGN KEY (nota_ingreso_id) REFERENCES notas_ingreso(id) ON DELETE CASCADE
);

CREATE TABLE notas_salida (
  id INT NOT NULL AUTO_INCREMENT,
  numero_salida VARCHAR(50) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  estado ENUM('REGISTRADA', 'COMPLETADA', 'PARCIAL') DEFAULT 'REGISTRADA',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX IDX_notas_salida_fecha (fecha)
);

CREATE TABLE nota_salida_detalles (
  id INT NOT NULL AUTO_INCREMENT,
  nota_salida_id INT NOT NULL,
  producto_id INT NOT NULL,
  lote_numero VARCHAR(100),
  cantidad DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id),
  INDEX IDX_nota_salida_detalles_nota (nota_salida_id),
  FOREIGN KEY (nota_salida_id) REFERENCES notas_salida(id) ON DELETE CASCADE
);
        `;
        
        const statements = schemaSql.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            if (stmt.trim()) {
                try {
                    await conn.execute(stmt);
                } catch (e) {
                    console.log(`  ⚠️  ${e.message.substring(0, 60)}`);
                }
            }
        }
        
        console.log('✅ Schema creado\n');
        
        // MIGRAR PRODUCTOS
        console.log('📦 MIGRANDO PRODUCTOS...\n');
        let prodContent = fs.readFileSync(prodFile, 'utf-8');
        // Remover BOM si existe
        if (prodContent.charCodeAt(0) === 0xfeff) {
            prodContent = prodContent.slice(1);
        }
        const prodLineas = prodContent.split('\n').filter(l => l.trim());
        const productosMap = {};
        let prodCount = 0;
        
        console.log(`  Total de líneas en Productos.csv: ${prodLineas.length}`);
        
        // Debug: mostrar primeros datos
        if (prodLineas.length > 1) {
            const v = prodLineas[1].split(';');
            console.log(`  Primer dato - [1]: "${v[1]}", [2]: "${v[2]}"`);
        }
        
        for (let i = 1; i < prodLineas.length; i++) {
            const v = prodLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const nombre = (v[2] || '').trim();
            const proveedor = (v[7] || '').trim();
            const fabricante = (v[21] || '').trim();
            
            if (!codProd || !nombre) {
                if (i <= 5) console.log(`  Línea ${i} saltada: código="${codProd}", nombre="${nombre}"`);
                continue;
            }
            
            if (i <= 5) console.log(`  Línea ${i}: insertando "${codProd}" - "${nombre}"`);
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO productos (codigo, descripcion, proveedor, fabricante) 
                     VALUES (?, ?, ?, ?)`,
                    [codProd, nombre, proveedor || 'Desconocido', fabricante || 'Desconocido']
                );
                productosMap[codProd] = r.insertId;
                prodCount++;
                if (prodCount % 200 === 0) process.stdout.write(`  ...${prodCount}\n`);
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error en BD: ${e.message.substring(0, 80)}`);
                }
                // Intenta recuperar ID del producto  existente
                try {
                    const [existente] = await conn.execute(
                        `SELECT id FROM productos WHERE codigo = ?`,
                        [codProd]
                    );
                    if (existente.length > 0) {
                        productosMap[codProd] = existente[0].id;
                    }
                } catch (e2) {}
            }
        }
        
        console.log(`✅ Productos: ${prodCount} productos migrados\n`);
        
        // ============ INGRESOS ============
        console.log('📥 MIGRANDO INGRESOS...\n');
        let ingContent = fs.readFileSync(ingFile, 'utf-8');
        if (ingContent.charCodeAt(0) === 0xfeff) {
            ingContent = ingContent.slice(1);
        }
        const ingLineas = ingContent.split('\n').filter(l => l.trim());
        let ingCount = 0;
        
        console.log(`  Total de líneas en ingreso.csv: ${ingLineas.length}`);
        
        for (let i = 1; i < ingLineas.length; i++) {
            const v = ingLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const lote = (v[3] || '').trim();
            let fechaStr = (v[13] || '').trim();
            const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            const productoId = productosMap[codProd] || 1;
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO notas_ingreso (numero_ingreso, fecha, proveedor, estado) 
                     VALUES (?, ?, ?, 'RECIBIDA_CONFORME')`,
                    [`ING-${Date.now()}-${i}`, fecha, 'PROVEEDOR']
                );
                
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles (nota_ingreso_id, producto_id, lote_numero, cantidad) 
                     VALUES (?, ?, ?, ?)`,
                    [r.insertId, productoId, lote || 'SIN-LOTE', cantidad]
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
        let salContent = fs.readFileSync(salFile, 'utf-8');
        if (salContent.charCodeAt(0) === 0xfeff) {
            salContent = salContent.slice(1);
        }
        const salLineas = salContent.split('\n').filter(l => l.trim());
        let salCount = 0;
        
        console.log(`  Total de líneas en salida.csv: ${salLineas.length}`);
        
        for (let i = 1; i < salLineas.length; i++) {
            const v = salLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const lote = (v[3] || '').trim();
            let fechaStr = (v[16] || '').trim();
            const cantidad = parseFloat((v[10] || '0').trim().replace(',', '.')) || 0;
            
            if (!codProd || !fechaStr || cantidad === 0) continue;
            
            const fecha = parseFecha(fechaStr);
            if (!fecha) continue;
            
            const productoId = productosMap[codProd] || 1;
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                     VALUES (?, ?, 'REGISTRADA')`,
                    [`SAL-${Date.now()}-${i}`, fecha]
                );
                
                await conn.execute(
                    `INSERT INTO nota_salida_detalles (nota_salida_id, producto_id, lote_numero, cantidad) 
                     VALUES (?, ?, ?, ?)`,
                    [r.insertId, productoId, lote || 'SIN-LOTE', cantidad]
                );
                
                salCount++;
                if (salCount % 200 === 0) process.stdout.write(`  ...${salCount}\n`);
            } catch (e) {
                // Silencioso
            }
        }
        
        console.log(`✅ Salidas: ${salCount} notas migradas\n`);
        
        console.log('═'.repeat(70));
        console.log(`✅ MIGRACIÓN COMPLETADA`);
        console.log(`   📦 Productos: ${prodCount}`);
        console.log(`   📥 Ingresos: ${ingCount} notas`);
        console.log(`   📤 Salidas: ${salCount} notas`);
        console.log(`   📊 Total: ${prodCount + ingCount + salCount} registros`);
        console.log('═'.repeat(70) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        console.error(e.stack);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
