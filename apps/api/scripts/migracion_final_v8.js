/**
 * MIGRACIÓN v8 - PARSER CSV ROBUSTO
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

console.log('\n' + '═'.repeat(70));
console.log('🚀 MIGRACIÓN v8 - PARSER CSV ROBUSTO');
console.log('═'.repeat(70) + '\n');

const projectRoot = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN';
const prodFile = path.join(projectRoot, 'Productos.csv');

// Parser CSV mejorado que maneja campos con saltos de línea
function parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ';' && !insideQuotes) {
            fields.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    fields.push(currentField.trim());
    return fields;
}

// Parser robusto para CSVs con saltos de línea dentro de celdas
function parseCSVRobust(content) {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
            currentLine += char;
        } else if (char === '\n' && !insideQuotes) {
            if (currentLine.trim()) {
                lines.push(currentLine);
            }
            currentLine = '';
        } else {
            currentLine += char;
        }
    }
    
    if (currentLine.trim()) {
        lines.push(currentLine);
    }
    
    return lines.map(line => parseCSVLine(line));
}

function parseFecha(str) {
    if (!str || str.trim() === '' || str === 'N/A') return null;
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
        console.log('📦 PROCESANDO CSV CON PARSER ROBUSTO...\n');
        
        let prodContent = fs.readFileSync(prodFile, 'utf-8');
        if (prodContent.charCodeAt(0) === 0xfeff) {
            prodContent = prodContent.slice(1);
        }
        
        const prodData = parseCSVRobust(prodContent);
        let prodCount = 0;
        let errorCount = 0;
        
        console.log(`  Total de filas parseadas: ${prodData.length}\n`);
        
        // Saltar encabezado (primera fila)
        for (let i = 1; i < prodData.length; i++) {
            const v = prodData[i];
            
            // Validar que tiene suficientes columnas
            if (!v || v.length < 24) {
                if (i <= 5) console.log(`  ⚠️  Línea ${i}: No tiene suficientes columnas (${v ? v.length : 0})`);
                errorCount++;
                continue;
            }
            
            const codProd = (v[1] || '').trim();  // [1] = Cod. Producto
            const nombre = (v[2] || '').trim();  // [2] = Producto
            const lote = (v[3] || '').trim();  // [3] = Lote
            const regSanitario = (v[4] || '').trim();  // [4] = Registro Sanitario
            const proveedor = (v[7] || '').trim();  // [7] = Proveedor
            const tipoDoc = (v[11] || '').trim();  // [11] = T. Documento
            const numDoc = (v[12] || '').trim();  // [12] = N° de Documento
            const fabricante = (v[22] || '').trim();  // [22] = Fabricante
            const procedencia = (v[23] || '').trim();  // [23] = Procedencia
            const fechaIngreso = parseFecha(v[9] || '');  // [9] = Fecha Ingreso
            
            if (!codProd || !nombre) {
                if (i <= 5) console.log(`  ⚠️  Línea ${i}: Código o nombre vacío`);
                errorCount++;
                continue;
            }
            
            if (i <= 5 || i % 300 === 0) {
                console.log(`  ✓ Línea ${i}: "${codProd}" - Lote:"${lote || '-'}" - Prov:"${proveedor || '-'}"`);
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
            } catch (e) {
                if (i <= 5) {
                    console.log(`    ❌ Error BD: ${e.message.substring(0, 60)}`);
                }
                errorCount++;
            }
        }
        
        console.log(`\n✅ Actualización completada:`);
        console.log(`   • Productos actualizados: ${prodCount}`);
        console.log(`   • Errores: ${errorCount}`);
        console.log(`   • Tasa de éxito: ${((prodCount / (prodCount + errorCount)) * 100).toFixed(1)}%\n`);
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

migrar();
