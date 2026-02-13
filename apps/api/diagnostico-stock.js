// Script para diagnosticar inconsistencias entre stock global y lotes
// Ejecutar con: node apps/api/diagnostico-stock.js

const { DataSource } = require('typeorm');
const path = require('path');

// Cargar entidades
const entities = [
    require('./src/entities/Producto'),
    require('./src/entities/Lote'),
    require('./src/entities/Kardex')
];

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(__dirname, '../../database.sqlite'),
    entities: entities,
    synchronize: false,
    logging: false
});

async function diagnosticar() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conectado a la base de datos\n');

        const productoRepo = AppDataSource.getRepository('Producto');
        const loteRepo = AppDataSource.getRepository('Lote');

        // Obtener todos los productos
        const productos = await productoRepo.find();

        console.log('🔍 DIAGNÓSTICO DE INCONSISTENCIAS DE STOCK\n');
        console.log('='.repeat(80));

        let inconsistenciasEncontradas = 0;

        for (const producto of productos) {
            // Obtener todos los lotes del producto
            const lotes = await loteRepo.find({
                where: { producto_id: producto.id }
            });

            // Calcular suma de lotes disponibles
            const sumaLotes = lotes.reduce((sum, lote) => {
                return sum + Number(lote.cantidad_disponible || 0);
            }, 0);

            const stockGlobal = Number(producto.stock_actual || 0);
            const diferencia = stockGlobal - sumaLotes;

            // Si hay diferencia, reportar
            if (Math.abs(diferencia) > 0.001) {
                inconsistenciasEncontradas++;
                console.log(`\n❌ INCONSISTENCIA ENCONTRADA:`);
                console.log(`   Producto ID: ${producto.id}`);
                console.log(`   Código: ${producto.codigo}`);
                console.log(`   Descripción: ${producto.descripcion}`);
                console.log(`   Stock Global: ${stockGlobal.toFixed(2)}`);
                console.log(`   Suma de Lotes: ${sumaLotes.toFixed(2)}`);
                console.log(`   Diferencia: ${diferencia.toFixed(2)}`);
                console.log(`   Lotes:`);
                lotes.forEach(lote => {
                    console.log(`      - Lote ${lote.numero_lote}: ${Number(lote.cantidad_disponible).toFixed(2)} disponibles`);
                });
            }
        }

        console.log('\n' + '='.repeat(80));
        if (inconsistenciasEncontradas === 0) {
            console.log('\n✅ No se encontraron inconsistencias');
        } else {
            console.log(`\n⚠️  Total de inconsistencias encontradas: ${inconsistenciasEncontradas}`);
            console.log('\n💡 SOLUCIÓN RECOMENDADA:');
            console.log('   1. Revisar el kardex para identificar movimientos incorrectos');
            console.log('   2. Ejecutar el script de corrección de stock');
            console.log('   3. O ajustar manualmente los lotes para que coincidan con el stock global');
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

diagnosticar();
