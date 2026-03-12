const fs = require('fs');
const path = require('path');
const readline = require('readline');
const AppDataSource = require('../src/config/database');

function normalizarEncabezado(valor = '') {
    return String(valor)
        .normalize('NFD')
        .replace(/[^\w\s.]/g, '')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function construirMapaEncabezados(headerLine) {
    const columnas = headerLine.split(';').map(h => h.trim());
    const mapa = new Map();

    columnas.forEach((nombre, index) => {
        mapa.set(normalizarEncabezado(nombre), index);
    });

    return mapa;
}

function obtenerValor(columns, headerMap, aliases, fallbackIndex = null) {
    for (const alias of aliases) {
        const idx = headerMap.get(normalizarEncabezado(alias));
        if (idx !== undefined && idx < columns.length) {
            return (columns[idx] || '').trim();
        }
    }

    if (fallbackIndex !== null && fallbackIndex < columns.length) {
        return (columns[fallbackIndex] || '').trim();
    }

    return '';
}

function parsearNumero(valor) {
    if (!valor) return 0;
    const limpio = String(valor).replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    return parseFloat(limpio) || 0;
}

async function importarLotesDesdeCSV() {
    console.log('🚀 Iniciando importación de lotes desde CSV...\n');

    try {
        // Inicializar conexión a BD
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida\n');

        const productoRepo = AppDataSource.getRepository('Producto');
        const loteRepo = AppDataSource.getRepository('Lote');

        // Leer archivo CSV
        const csvPath = process.argv[2] || process.env.SALIDAS_CSV_PATH || '/home/ezku/tmp/salida.csv';
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const lotesMap = new Map(); // Map para evitar duplicados
        let lineNumber = 0;
        let isFirstLine = true;
        let headerMap = null;

        console.log('📖 Leyendo archivo CSV...\n');

        for await (const line of rl) {
            lineNumber++;
            
            if (isFirstLine) {
                headerMap = construirMapaEncabezados(line);
                isFirstLine = false;
                continue; // Saltar encabezado
            }

            // Separar por punto y coma
            const columns = line.split(';');
            
            if (columns.length < 6) {
                continue; // Línea incompleta
            }

            const codigoProducto = obtenerValor(columns, headerMap, ['Cod. Producto', 'codigo_producto'], 1);
            const numeroLote = obtenerValor(columns, headerMap, ['Lote', 'numero_lote'], 3);
            const fechaVctoStr = obtenerValor(columns, headerMap, ['Fecha Vcto', 'fecha_vencimiento'], 4);

            // Validar datos básicos
            if (!codigoProducto || !numeroLote || numeroLote === '' || numeroLote === 'N/A') {
                continue;
            }

            // Parsear fecha de vencimiento (D/M/YYYY o M/D/YYYY)
            let fechaVencimiento = null;
            if (fechaVctoStr && fechaVctoStr !== 'N/A' && fechaVctoStr !== '') {
                const partes = fechaVctoStr.split('/');
                if (partes.length === 3) {
                    const p1 = Number(partes[0]);
                    const p2 = Number(partes[1]);
                    const anio = partes[2];
                    const mes = (p1 > 12 ? p2 : p1).toString().padStart(2, '0');
                    const dia = (p1 > 12 ? p1 : p2).toString().padStart(2, '0');
                    fechaVencimiento = `${anio}-${mes}-${dia}`;
                }
            }

            // Crear clave única para el lote
            const loteKey = `${codigoProducto}||${numeroLote}||${fechaVencimiento || 'NULL'}`;

            if (!lotesMap.has(loteKey)) {
                lotesMap.set(loteKey, {
                    codigoProducto,
                    numeroLote,
                    fechaVencimiento,
                    cantidadTotal: 0
                });
            }

            const cantidad = parsearNumero(obtenerValor(columns, headerMap, ['Cant.Total_Salida', 'cantidad_total_salida', 'cantidad'], 10));
            const loteData = lotesMap.get(loteKey);
            loteData.cantidadTotal += cantidad;
        }

        console.log(`✅ Archivo procesado: ${lineNumber} líneas`);
        console.log(`📦 Lotes únicos encontrados: ${lotesMap.size}\n`);

        // Insertar lotes en la BD
        let lotesCreados = 0;
        let lotesOmitidos = 0;
        let errores = 0;

        console.log('💾 Insertando lotes en la base de datos...\n');

        for (const [key, loteData] of lotesMap) {
            try {
                // Buscar producto por código
                const producto = await productoRepo.findOne({
                    where: { codigo: loteData.codigoProducto }
                });

                if (!producto) {
                    console.log(`⚠️  Producto no encontrado: ${loteData.codigoProducto} - Lote: ${loteData.numeroLote}`);
                    lotesOmitidos++;
                    continue;
                }

                // Verificar si el lote ya existe
                const loteExistente = await loteRepo.findOne({
                    where: {
                        producto_id: producto.id,
                        numero_lote: loteData.numeroLote
                    }
                });

                if (loteExistente) {
                    lotesOmitidos++;
                    continue;
                }

                // Crear nuevo lote
                const nuevoLote = loteRepo.create({
                    producto_id: producto.id,
                    numero_lote: loteData.numeroLote,
                    fecha_vencimiento: loteData.fechaVencimiento,
                    cantidad_ingresada: loteData.cantidadTotal,
                    cantidad_disponible: loteData.cantidadTotal,
                    nota_ingreso_id: null // No hay nota de ingreso asociada
                });

                await loteRepo.save(nuevoLote);
                lotesCreados++;

                if (lotesCreados % 50 === 0) {
                    console.log(`  ➡️  ${lotesCreados} lotes creados...`);
                }

            } catch (error) {
                console.error(`❌ Error al crear lote ${loteData.numeroLote}:`, error.message);
                errores++;
            }
        }

        console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
        console.log('═'.repeat(50));
        console.log(`✅ Lotes creados:     ${lotesCreados}`);
        console.log(`⚠️  Lotes omitidos:    ${lotesOmitidos}`);
        console.log(`❌ Errores:           ${errores}`);
        console.log(`📦 Total procesados:  ${lotesMap.size}`);
        console.log('═'.repeat(50));

    } catch (error) {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n👋 Conexión a BD cerrada');
        }
    }
}

// Ejecutar importación
importarLotesDesdeCSV()
    .then(() => {
        console.log('\n✅ Importación completada exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en importación:', error);
        process.exit(1);
    });
