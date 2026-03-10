const AppDataSource = require('../src/config/database');

async function asignarLotesFaltantes() {
    console.log('🔄 Inicializando conexión a BD...');
    await AppDataSource.initialize();

    const detalleRepo = AppDataSource.getRepository('NotaSalidaDetalle');
    const loteRepo = AppDataSource.getRepository('Lote');

    console.log('📖 Buscando detalles sin lote asignado...\n');

    // Buscar todos los detalles sin lote
    const detallesSinLote = await detalleRepo.find({
        where: { lote_id: null },
        order: { id: 'ASC' }
    });

    console.log(`📦 Encontrados ${detallesSinLote.length} detalles sin lote\n`);

    let actualizados = 0;
    let sinLoteDisponible = 0;
    const productosMap = new Map();

    for (const detalle of detallesSinLote) {
        try {
            const productoId = detalle.producto_id;

            // Buscar lotes disponibles para este producto
            // (ordenados por fecha de vencimiento FIFO)
            const lotesDisponibles = await loteRepo
                .createQueryBuilder('lote')
                .where('lote.producto_id = :productoId', { productoId })
                .andWhere('lote.cantidad_disponible > 0')
                .orderBy('lote.fecha_vencimiento', 'ASC')
                .getMany();

            if (lotesDisponibles.length > 0) {
                // Asignar el primer lote disponible (FIFO)
                const lote = lotesDisponibles[0];
                
                await detalleRepo.update(detalle.id, { lote_id: lote.id });
                actualizados++;

                if (!productosMap.has(productoId)) {
                    productosMap.set(productoId, 0);
                }
                productosMap.set(productoId, productosMap.get(productoId) + 1);

                if (actualizados % 100 === 0) {
                    console.log(`  ➡️  ${actualizados} detalles actualizados...`);
                }
            } else {
                sinLoteDisponible++;
            }

        } catch (error) {
            console.error(`❌ Error al asignar lote al detalle ${detalle.id}: ${error.message}`);
        }
    }

    console.log('\n📊 RESUMEN DE ASIGNACIÓN:');
    console.log('══════════════════════════════════════════════════');
    console.log(`✅ Detalles actualizados:     ${actualizados}`);
    console.log(`⚠️  Sin lote disponible:       ${sinLoteDisponible}`);
    console.log(`📦 Total procesados:          ${detallesSinLote.length}`);
    console.log('══════════════════════════════════════════════════\n');

    if (productosMap.size > 0) {
        console.log('📋 Productos actualizados:');
        for (const [productoId, cantidad] of productosMap.entries()) {
            console.log(`   Producto ID ${productoId}: ${cantidad} detalles`);
        }
        console.log('');
    }

    await AppDataSource.destroy();
    console.log('👋 Conexión a BD cerrada\n');
    console.log('✅ Asignación completada');
}

asignarLotesFaltantes().catch(err => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
});
