const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'almacen_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const createTablesSQL = `
-- Crear tabla actas_recepcion
CREATE TABLE IF NOT EXISTS actas_recepcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo_documento VARCHAR(100),
    numero_documento VARCHAR(100),
    cliente_id INT NOT NULL,
    proveedor VARCHAR(255),
    tipo_operacion VARCHAR(50),
    tipo_conteo VARCHAR(100),
    condicion_temperatura VARCHAR(100),
    observaciones TEXT,
    responsable_recepcion VARCHAR(255),
    responsable_entrega VARCHAR(255),
    jefe_almacen VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_cliente_id (cliente_id),
    KEY idx_fecha (fecha),
    KEY idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla actas_recepcion_detalles
CREATE TABLE IF NOT EXISTS actas_recepcion_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acta_id INT NOT NULL,
    producto_id INT,
    producto_codigo VARCHAR(100),
    producto_nombre VARCHAR(255),
    fabricante VARCHAR(200),
    lote_numero VARCHAR(100),
    fecha_vencimiento DATE,
    um VARCHAR(50),
    temperatura_min DECIMAL(5,2),
    temperatura_max DECIMAL(5,2),
    cantidad_solicitada DECIMAL(10,2),
    cantidad_recibida DECIMAL(10,2),
    cantidad_bultos DECIMAL(10,2) DEFAULT 0,
    cantidad_cajas DECIMAL(10,2) DEFAULT 0,
    cantidad_por_caja DECIMAL(10,2) DEFAULT 0,
    cantidad_fraccion DECIMAL(10,2) DEFAULT 0,
    aspecto VARCHAR(100) DEFAULT 'EMB',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_acta_id (acta_id),
    KEY idx_producto_id (producto_id),
    FOREIGN KEY (acta_id) REFERENCES actas_recepcion(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function createTables() {
    const connection = await pool.getConnection();
    try {
        console.log('🟢 Creando tablas de actas de recepción...');
        
        // Split por punto y coma para ejecutar cada statement
        const statements = createTablesSQL.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        console.log('✅ Tablas actas_recepcion y actas_recepcion_detalles creadas correctamente');
        
    } catch (error) {
        console.error('❌ Error creando tablas:', error.message);
        process.exit(1);
    } finally {
        await connection.release();
        await pool.end();
    }
}

createTables();
