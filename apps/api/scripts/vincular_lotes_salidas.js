const fs = require('fs');
const readline = require('readline');
const AppDataSource = require('../src/config/database');

async function vincularLotesConSalidas() {
    console.log('🔄 Inicializando conexión a BD...');
    await AppDataSource.initialize();

    const productoRepo = AppDataSource.getRepository('Producto');
    const loteRepo = AppDataSource.getRepository('Lote');
    const notaSalidaRepo = AppDataSource.getRepository('NotaSalida');
    const detalleRepo = AppDataSource.getRepository('NotaSalidaDetalle');

    const csvPath = '/home/ezku/Imágenes/salida.csv';
    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    let actualizados = 0;
    let noEncontrados = 0;
    let sinLote = 0;
    let procesados = 0;

    console.log('📖 Procesando CSV...\n');

    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }

        const columns = line.split(';');
        if (columns.length < 17) continue;

        const codigoProducto = columns[1]?.trim();
        const numeroLote = columns[3]?.trim();
        const fechaVctoStr = columns[4]?.trim();
        const cantidad = parseFloat(columns[10]?.trim() || '0');
        const fechaSalidaStr = columns[16]?.trim(); // Formato D/M/YYYY

        // Validar datos
        if (!codigoProducto || !fechaSalidaStr || cantidad === 0) {
            continue;
        }

        if (!numeroLote || numeroLote === '' || numeroLote === 'N/A') {
            sinLote++;
            continue;
        }

        procesados++;

        try {
            // Parsear fecha de salida (D/M/YYYY)
            const partesFechaSalida = fechaSalidaStr.split('/');
            if (partesFechaSalida.length !== 3) continue;

            const diaSalida = partesFechaSalida[0].padStart(2, '0');
            const mesSalida = partesFechaSalida[1].padStart(2, '0');
            const anioSalida = partesFechaSalida[2];
            const fechaSalida = `${anioSalida}-${mesSalida}-${diaSalida}`;

            // Parsear fecha vencimiento (M/D/YYYY)
            let fechaVencimiento = null;
            if (fechaVctoStr && fechaVctoStr !== 'N/A' && fechaVctoStr !== '') {
                const partesVcto = fechaVctoStr.split('/');
                if (partesVcto.length === 3) {
                    const mes = partesVcto[0].padStart(2, '0');
                    const dia = partesVcto[1].padStart(2, '0');
                    const anio = partesVcto[2];
                    fechaVencimiento = `${anio}-${mes}-${dia}`;
                }
            }

            // 1. Buscar producto
            const producto = await productoRepo.findOne({
                where: { codigo: codigoProducto }
            });

            if (!producto) {
                if (procesados <= 5) {
                    console.log(`⚠️  Producto no encontrado: ${codigoProducto}`);
                }
                continue;
            }

            // 2. Buscar lote
            const whereClauseLote = {
                producto_id: producto.id,
                numero_lote: numeroLote
            };
            if (fechaVencimiento) {
                whereClauseLote.fecha_vencimiento = fechaVencimiento;
            }

            const lote = await loteRepo.findOne({
                where: whereClauseLote
            });

            if (!lote) {
                if (procesados <= 5) {
                    console.log(`⚠️  Lote no encontrado: ${numeroLote} (producto: ${producto.codigo}, fecha_vcto: ${fechaVencimiento})`);
                }
                continue;
            }

            // 3. Buscar nota de salida por fecha (usando rango para incluir toda el día)
            const fechaInicio = new Date(fechaSalida);
            fechaInicio.setHours(0, 0, 0, 0);
            const fechaFin = new Date(fechaSalida);
            fechaFin.setHours(23, 59, 59, 999);

            const notasSalida = await notaSalidaRepo
                .createQueryBuilder('nota')
                .where('nota.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('nota.fecha <= :fechaFin', { fechaFin })
                .getMany();

            if (notasSalida.length === 0) {
                if (procesados <= 5) {
                    console.log(`⚠️  Nota de salida no encontrada para fecha: ${fechaSalida}`);
                }
                continue;
            }

            // 4. Buscar detalle que coincida con producto (sin verificar cantidad exacta)
            for (const nota of notasSalida) {
                // Primero intentar con cantidad exacta
                let detalle = await detalleRepo.findOne({
                    where: {
                        nota_salida_id: nota.id,
                        producto_id: producto.id,
                        cantidad: cantidad,
                        lote_id: null
                    }
                });

                // Si no encuentra con cantidad exacta, buscar sin cantidad
                if (!detalle) {
                    detalle = await detalleRepo.findOne({
                        where: {
                            nota_salida_id: nota.id,
                            producto_id: producto.id,
                            lote_id: null
                        }
                    });
                }

                if (detalle) {
                    // Actualizar lote_id
                    await detalleRepo.update(detalle.id, { lote_id: lote.id });
                    actualizados++;
                    
                    if (actualizados % 50 === 0) {
                        console.log(`  ➡️  ${actualizados} detalles actualizados...`);
                    }
                    break; // Solo actualizar uno por línea
                } else if (procesados <= 5) {
                    console.log(`⚠️  Detalle no encontrado: nota=${nota.id}, producto=${producto.id}`);
                }
            }

        } catch (error) {
            noEncontrados++;
            if (noEncontrados <= 10) {
                console.error(`❌ Error al procesar [${codigoProducto}/${numeroLote}]: ${error.message}`);
            }
        }
    }

    console.log('\n📊 RESUMEN DE VINCULACIÓN:');
    console.log('══════════════════════════════════════════════════');
    console.log(`✅ Detalles actualizados:  ${actualizados}`);
    console.log(`⚠️  Sin lote en CSV:        ${sinLote}`);
    console.log(`❌ No encontrados:         ${noEncontrados}`);
    console.log(`📦 Total procesados:       ${procesados}`);
    console.log('══════════════════════════════════════════════════\n');

    await AppDataSource.destroy();
    console.log('👋 Conexión a BD cerrada\n');
    console.log('✅ Vinculación completada');
}

vincularLotesConSalidas().catch(err => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
});
