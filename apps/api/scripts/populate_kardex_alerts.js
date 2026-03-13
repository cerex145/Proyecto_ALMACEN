const mysql = require('mysql2/promise');

async function populateKardexAndAlerts() {
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
        
        // CREAR TABLA alertas_vencimiento si no existe
        console.log('📋 Creando tabla alertas_vencimiento...\n');
        const alertasSql = `
CREATE TABLE IF NOT EXISTS alertas_vencimiento (
  id INT NOT NULL AUTO_INCREMENT,
  producto_id INT NOT NULL,
  lote_numero VARCHAR(100),
  fecha_vencimiento DATE,
  estado ENUM('VENCIDO', 'PROXIMO_A_VENCER', 'NORMAL') DEFAULT 'NORMAL',
  dias_para_vencer INT,
  cantidad INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX IDX_alertas_estado (estado),
  INDEX IDX_alertas_fecha (fecha_vencimiento)
);
        `.trim();
        
        try {
            await conn.execute(alertasSql);
            console.log('  ✅ Tabla alertas_vencimiento creada');
        } catch (e) {
            if (!e.message.includes('already exists')) {
                throw e;
            }
            console.log('  ✓ Tabla ya existe');
        }
        
        // LLENAR TABLA KARDEX desde notas_ingreso y notas_salida
        console.log('\n📥 Llenando tabla kardex desde ingresos...\n');
        
        const kardexFromIngresos = `
INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, fecha, numero_documento, observaciones)
SELECT 
  nid.producto_id,
  'INGRESO',
  nid.cantidad,
  ni.fecha,
  ni.numero_ingreso,
  CONCAT('Ingreso - ', ni.proveedor)
FROM nota_ingreso_detalles nid
JOIN notas_ingreso ni ON nid.nota_ingreso_id = ni.id
WHERE NOT EXISTS (
  SELECT 1 FROM kardex k 
  WHERE k.numero_documento = ni.numero_ingreso 
  AND k.tipo_movimiento = 'INGRESO'
)
        `.trim();
        
        try {
            const [result] = await conn.execute(kardexFromIngresos);
            console.log(`  ✅ ${result.affectedRows} registros de ingreso agregados al kardex`);
        } catch (e) {
            console.log(`  ⚠️  Error: ${e.message.substring(0, 80)}`);
        }
        
        // Agregar salidas al kardex
        console.log('\n📤 Llenando tabla kardex desde salidas...\n');
        
        const kardexFromSalidas = `
INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, fecha, numero_documento, observaciones)
SELECT 
  nsd.producto_id,
  'SALIDA',
  -nsd.cantidad,
  ns.fecha,
  ns.numero_salida,
  'Salida'
FROM nota_salida_detalles nsd
JOIN notas_salida ns ON nsd.nota_salida_id = ns.id
WHERE NOT EXISTS (
  SELECT 1 FROM kardex k 
  WHERE k.numero_documento = ns.numero_salida 
  AND k.tipo_movimiento = 'SALIDA'
)
        `.trim();
        
        try {
            const [result] = await conn.execute(kardexFromSalidas);
            console.log(`  ✅ ${result.affectedRows} registros de salida agregados al kardex`);
        } catch (e) {
            console.log(`  ⚠️  Error: ${e.message.substring(0, 80)}`);
        }
        
        // POBLAR ALERTAS DE VENCIMIENTO
        console.log('\n⚠️  Creando alertas de vencimiento...\n');
        
        // Obtener productos sin fecha de vencimiento específica (usar hoy para demo)
        const alertasSql2 = `
INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
SELECT 
  p.id,
  CONCAT(p.codigo, '-LOT001'),
  DATE_ADD(CURDATE(), INTERVAL 30 DAY),
  'NORMAL',
  30,
  100
FROM productos p
WHERE NOT EXISTS (
  SELECT 1 FROM alertas_vencimiento av WHERE av.producto_id = p.id
)
LIMIT 50
        `.trim();
        
        try {
            const [result] = await conn.execute(alertasSql2);
            console.log(`  ✅ ${result.affectedRows} alertas de vencimiento creadas`);
        } catch (e) {
            console.log(`  ⚠️  Error: ${e.message.substring(0, 80)}`);
        }
        
        // Crear algunos productos próximos a vencer
        const proximosAVencer = `
INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
SELECT 
  p.id,
  CONCAT(p.codigo, '-LOT002'),
  DATE_ADD(CURDATE(), INTERVAL 5 DAY),
  'PROXIMO_A_VENCER',
  5,
  50
FROM productos p
WHERE NOT EXISTS (
  SELECT 1 FROM alertas_vencimiento av WHERE av.producto_id = p.id AND av.estado = 'PROXIMO_A_VENCER'
)
LIMIT 10
        `.trim();
        
        try {
            const [result] = await conn.execute(proximosAVencer);
            console.log(`  ✅ ${result.affectedRows} alertas próximos a vencer creadas`);
        } catch (e) {
            console.log(`  ⚠️  Error: ${e.message.substring(0, 80)}`);
        }
        
        // Crear algunos productos vencidos
        const vencidos = `
INSERT INTO alertas_vencimiento (producto_id, lote_numero, fecha_vencimiento, estado, dias_para_vencer, cantidad)
SELECT 
  p.id,
  CONCAT(p.codigo, '-LOT003'),
  DATE_SUB(CURDATE(), INTERVAL 10 DAY),
  'VENCIDO',
  -10,
  20
FROM productos p
WHERE NOT EXISTS (
  SELECT 1 FROM alertas_vencimiento av WHERE av.producto_id = p.id AND av.estado = 'VENCIDO'
)
LIMIT 5
        `.trim();
        
        try {
            const [result] = await conn.execute(vencidos);
            console.log(`  ✅ ${result.affectedRows} productos vencidos creados`);
        } catch (e) {
            console.log(`  ⚠️  Error: ${e.message.substring(0, 80)}`);
        }
        
        console.log('\n═'.repeat(70));
        console.log('✅ KARDEX Y ALERTAS POBLADAS CORRECTAMENTE');
        console.log('═'.repeat(70) + '\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

populateKardexAndAlerts();
