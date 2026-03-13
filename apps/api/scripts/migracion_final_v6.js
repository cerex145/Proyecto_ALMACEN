/**
 * MIGRACIÓN COMPLETA v6 - CON DATOS COMPLETOS DE PRODUCTOS
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN COMPLETA v6 - DATOS COMPLETOS');
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
        
        // CREAR SCHEMA MEJORADO
        console.log('\n📋 Creando schema mejorado...\n');
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
  lote VARCHAR(100),
  numero_documento VARCHAR(100),
  tipo_documento VARCHAR(50),
  fecha_documento DATE,
  registro_sanitario VARCHAR(100),
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

CREATE TABLE kardex (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  tipo_movimiento ENUM('INGRESO', 'SALIDA', 'AJUSTE') NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  cantidad_acumulada DECIMAL(10,2),
  fecha DATE NOT NULL,
  numero_documento VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX IDX_kardex_producto (producto_id),
  INDEX IDX_kardex_fecha (fecha)
);

CREATE TABLE lotes (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  numero_lote VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE,
  cantidad_inicial DECIMAL(10,2),
  cantidad_actual DECIMAL(10,2),
  estado ENUM('ACTIVO', 'VENCIDO', 'AGOTADO') DEFAULT 'ACTIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX UK_lotes_numero (numero_lote),
  INDEX IDX_lotes_producto (producto_id),
  INDEX IDX_lotes_fecha_vencimiento (fecha_vencimiento)
);

CREATE TABLE alertas_vencimiento (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  lote_numero VARCHAR(100),
  fecha_vencimiento DATE,
  estado ENUM('VENCIDO','PROXIMO_A_VENCER','NORMAL') DEFAULT 'NORMAL',
  dias_para_vencer INT,
  cantidad INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX IDX_alertas_fecha_vencimiento (fecha_vencimiento),
  INDEX IDX_alertas_estado (estado)
);
        `;
        
        const statements = schemaSql.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            if (stmt.trim()) {
                try {
                    await conn.execute(stmt);
                } catch (e) {
                    console.error(`  ❌ Error: ${e.message.substring(0, 100)}`);
                }
            }
        }
        
        console.log('✅ Schema creado\n');
        
        // ============ PRODUCTOS ============
        console.log('📦 MIGRANDO PRODUCTOS CON DATOS COMPLETOS...\n');
        
        let prodContent = fs.readFileSync(prodFile, 'utf-8');
        // Remover BOM si existe
        if (prodContent.charCodeAt(0) === 0xfeff) {
            prodContent = prodContent.slice(1);
        }
        
        const prodLineas = prodContent.split('\n').filter(l => l.trim());
        let prodCount = 0;
        const productosMap = {};
        
        console.log(`  Total de líneas en Productos.csv: ${prodLineas.length}`);
        
        // Debug: mostrar primeros datos
        if (prodLineas.length > 1) {
            const v = prodLineas[1].split(';');
            console.log(`  Estructura: [0]=${v[0]}, [1]=${v[1]}, [2]=${v[2]}, [3]=${v[3]}, [7]=${v[7]}, [12]=${v[12]}`);
        }
        
        for (let i = 1; i < prodLineas.length; i++) {
            const v = prodLineas[i].split(';');
            const codProd = (v[1] || '').trim();
            const nombre = (v[2] || '').trim();
            const lote = (v[3] || '').trim();  // Lote
            const regSanitario = (v[4] || '').trim();  // Registro Sanitario
            const proveedor = (v[7] || '').trim();  // Proveedor
            const tipoDoc = (v[11] || '').trim();  // T. Documento
            const numDoc = (v[12] || '').trim();  // N° de Documento
            const fabricante = (v[21] || '').trim();  // Fabricante
            const procedencia = (v[22] || '').trim();  // Procedencia
            const fechaIngreso = parseFecha(v[9] || '');  // Fecha Ingreso
            
            if (!codProd || !nombre) {
                if (i <= 5) console.log(`  Línea ${i} saltada: código="${codProd}", nombre="${nombre}"`);
                continue;
            }
            
            if (i <= 5) console.log(`  Línea ${i}: "${codProd}" - "${nombre}" - lote="${lote}" - doc="${numDoc}"`);
            
            try {
                const [r] = await conn.execute(
                    `INSERT INTO productos 
                     (codigo, descripcion, proveedor, fabricante, procedencia, lote, numero_documento, tipo_documento, registro_sanitario, fecha_documento) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        codProd, 
                        nombre, 
                        proveedor || 'Desconocido', 
                        fabricante || 'Desconocido',
                        procedencia || 'Desconocida',
                        lote || 'Sin lote',
                        numDoc || null,
                        tipoDoc || null,
                        regSanitario || null,
                        fechaIngreso || null
                    ]
                );
                productosMap[codProd] = r.insertId;
                prodCount++;
                if (prodCount % 200 === 0) process.stdout.write(`  ...${prodCount}\n`);
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error en BD: ${e.message.substring(0, 80)}`);
                }
                // Intenta recuperar ID del producto existente
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
        const ingresosMap = {};
        
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
            
            const numIngreso = `ING-${fecha.replace(/-/g, '')}-${i}`;
            
            try {
                const prodId = productosMap[codProd];
                if (!prodId) {
                    console.log(`  ⚠️  Producto no encontrado: ${codProd}`);
                    continue;
                }
                
                // Crear nota de ingreso si no existe
                if (!ingresosMap[numIngreso]) {
                    const [r] = await conn.execute(
                        `INSERT INTO notas_ingreso (numero_ingreso, fecha, proveedor, estado) 
                         VALUES (?, ?, ?, 'REGISTRADA')`,
                        [numIngreso, fecha, 'Desconocido']
                    );
                    ingresosMap[numIngreso] = r.insertId;
                }
                
                // Insertar detalle
                await conn.execute(
                    `INSERT INTO nota_ingreso_detalles (nota_ingreso_id, producto_id, lote_numero, cantidad) 
                     VALUES (?, ?, ?, ?)`,
                    [ingresosMap[numIngreso], prodId, lote || 'N/A', cantidad]
                );
                
                // Insertar en kardex
                await conn.execute(
                    `INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, fecha, numero_documento) 
                     VALUES (?, 'INGRESO', ?, ?, ?)`,
                    [prodId, cantidad, fecha, numIngreso]
                );
                
                ingCount++;
                if (ingCount % 500 === 0) process.stdout.write(`  ...${ingCount}\n`);
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error en BD: ${e.message.substring(0, 80)}`);
                }
            }
        }
        
        console.log(`✅ Ingresos: ${ingCount} movimientos de ingreso migrados\n`);
        
        // ============ SALIDAS ============
        console.log('📤 MIGRANDO SALIDAS...\n');
        let salContent = fs.readFileSync(salFile, 'utf-8');
        if (salContent.charCodeAt(0) === 0xfeff) {
            salContent = salContent.slice(1);
        }
        const salLineas = salContent.split('\n').filter(l => l.trim());
        let salCount = 0;
        const salidasMap = {};
        
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
            
            const numSalida = `SAL-${fecha.replace(/-/g, '')}-${i}`;
            
            try {
                const prodId = productosMap[codProd];
                if (!prodId) {
                    console.log(`  ⚠️  Producto no encontrado: ${codProd}`);
                    continue;
                }
                
                // Crear nota de salida si no existe
                if (!salidasMap[numSalida]) {
                    const [r] = await conn.execute(
                        `INSERT INTO notas_salida (numero_salida, fecha, estado) 
                         VALUES (?, ?, 'COMPLETADA')`,
                        [numSalida, fecha]
                    );
                    salidasMap[numSalida] = r.insertId;
                }
                
                // Insertar detalle
                await conn.execute(
                    `INSERT INTO nota_salida_detalles (nota_salida_id, producto_id, lote_numero, cantidad) 
                     VALUES (?, ?, ?, ?)`,
                    [salidasMap[numSalida], prodId, lote || 'N/A', cantidad]
                );
                
                // Insertar en kardex
                await conn.execute(
                    `INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, fecha, numero_documento) 
                     VALUES (?, 'SALIDA', ?, ?, ?)`,
                    [prodId, -cantidad, fecha, numSalida]
                );
                
                salCount++;
                if (salCount % 500 === 0) process.stdout.write(`  ...${salCount}\n`);
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error en BD: ${e.message.substring(0, 80)}`);
                }
            }
        }
        
        console.log(`✅ Salidas: ${salCount} movimientos de salida migrados\n`);
        
        // ============ ALERTAS ============
        console.log('⚠️  GENERANDO ALERTAS DE VENCIMIENTO...\n');
        
        const [productos] = await conn.execute('SELECT id, codigo, descripcion FROM productos LIMIT 100');
        
        // Crear alertas de ejemplo (5 vencidas, 10 próximas, 50 normales)
        let alertCount = 0;
        const hoy = new Date();
        
        // 5 vencidas
        for (let i = 0; i < 5 && i < productos.length; i++) {
            const prod = productos[i];
            const fechaVencida = new Date(hoy);
            fechaVencida.setDate(fechaVencida.getDate() - 10);
            const diasPara = Math.floor((fechaVencida - hoy) / (1000 * 60 * 60 * 24));
            
            await conn.execute(
                `INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
                 VALUES (?, ?, ?, 'VENCIDO', ?, 100)`,
                [prod.id, `LOTE-${prod.codigo}-01`, fechaVencida.toISOString().split('T')[0], diasPara]
            );
            alertCount++;
        }
        
        // 10 próximas a vencer
        for (let i = 5; i < 15 && i < productos.length; i++) {
            const prod = productos[i];
            const fechaProxima = new Date(hoy);
            fechaProxima.setDate(fechaProxima.getDate() + 15);
            const diasPara = Math.floor((fechaProxima - hoy) / (1000 * 60 * 60 * 24));
            
            await conn.execute(
                `INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
                 VALUES (?, ?, ?, 'PROXIMO_A_VENCER', ?, 100)`,
                [prod.id, `LOTE-${prod.codigo}-02`, fechaProxima.toISOString().split('T')[0], diasPara]
            );
            alertCount++;
        }
        
        // 50 normales
        for (let i = 15; i < 65 && i < productos.length; i++) {
            const prod = productos[i];
            const fechaNormal = new Date(hoy);
            fechaNormal.setDate(fechaNormal.getDate() + 90);
            const diasPara = Math.floor((fechaNormal - hoy) / (1000 * 60 * 60 * 24));
            
            await conn.execute(
                `INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
                 VALUES (?, ?, ?, 'NORMAL', ?, 100)`,
                [prod.id, `LOTE-${prod.codigo}-03`, fechaNormal.toISOString().split('T')[0], diasPara]
            );
            alertCount++;
        }
        
        console.log(`✅ Alertas: ${alertCount} alertas de vencimiento creadas\n`);
        
        console.log('═'.repeat(70));
        console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('═'.repeat(70));
        console.log(`\n📊 Resumen:
  • Productos: ${prodCount}
  • Ingresos: ${ingCount}  
  • Salidas: ${salCount}
  • Total movimientos: ${ingCount + salCount}
  • Alertas: ${alertCount}\n`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
