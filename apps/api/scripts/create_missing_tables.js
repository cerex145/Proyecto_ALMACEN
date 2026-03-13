const mysql = require('mysql2/promise');

async function createMissingTables() {
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
        
        // Crear tabla kardex
        console.log('📋 Creando tabla kardex...\n');
        const kardexSql = `
CREATE TABLE IF NOT EXISTS kardex (
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
        `.trim();
        
        try {
            await conn.execute(kardexSql);
            console.log('  ✅ Tabla kardex creada');
        } catch (e) {
            console.log(`  ⚠️  ${e.message.substring(0, 80)}`);
        }
        
        // Crear tabla lotes
        console.log('\n📋 Creando tabla lotes...\n');
        const lotesSql = `
CREATE TABLE IF NOT EXISTS lotes (
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
        `.trim();
        
        try {
            await conn.execute(lotesSql);
            console.log('  ✅ Tabla lotes creada');
        } catch (e) {
            console.log(`  ⚠️  ${e.message.substring(0, 80)}`);
        }
        
        console.log('\n✅ TABLAS CREADAS CORRECTAMENTE\n');
        
    } catch (e) {
        console.error('❌ ERROR:', e.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

createMissingTables();
