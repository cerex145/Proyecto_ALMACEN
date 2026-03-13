const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * LIMPIADOR DE BD - Elimina registros migrados para re-migrar con datos corregidos
 */

console.log('\n🗑️  INICIANDO LIMPIEZA DE BASE DE DATOS...\n');

// Verificar que la BD esté configurada
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.error('❌ ERROR: Variables de entorno DB no configuradas');
    console.error('   Verifica que .env tenga: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
}

const mysql = require('mysql2/promise');

async function limpiarBD() {
    let connection;
    
    try {
        console.log(`📡 Conectando a BD: ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conexión establecida\n');
        
        // Desactivar foreign key checks temporalmente
        console.log('🔧 Desactivando restricciones de claves foráneas...');
        await connection.execute('SET FOREIGN_KEY_CHECKS=0;');
        
        // Tablas a limpiar (en orden de dependencias)
        const tablas = [
            'nota_salida_detalles',
            'nota_salida',
            'nota_ingreso_detalles',
            'nota_ingreso',
            'kardex'
        ];
        
        for (const tabla of tablas) {
            try {
                const [result] = await connection.execute(`DELETE FROM ${tabla};`);
                console.log(`   ✅ ${tabla}: ${result.affectedRows} registros eliminados`);
            } catch (error) {
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`   ⚠️  ${tabla}: Tabla no existe`);
                } else {
                    throw error;
                }
            }
        }
        
        // Re-activar foreign key checks
        console.log('\n🔧 Re-activando restricciones de claves foráneas...');
        await connection.execute('SET FOREIGN_KEY_CHECKS=1;');
        
        console.log('\n✅ LIMPIEZA COMPLETADA\n');
        
        return true;
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar
limpiarBD().then(exito => {
    if (exito) {
        console.log('='.repeat(70));
        console.log('📌 PRÓXIMO PASO: Re-migrar datos');
        console.log('='.repeat(70));
        console.log(`
Ejecuta el siguiente comando:

    cd apps/api
    node scripts/migrar_csv_urgente.js

Esto re-migrará los datos con las fechas corregidas.
`);
    } else {
        console.log('\n❌ No se puede continuar sin limpiar la BD');
        console.log('Intenta conectar manualmente a MySQL:');
        console.log(`
mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME}

DELETE FROM nota_salida_detalles;
DELETE FROM nota_salida;
DELETE FROM nota_ingreso_detalles;
DELETE FROM nota_ingreso;
DELETE FROM kardex;
COMMIT;
`);
    }
    process.exit(exito ? 0 : 1);
});
