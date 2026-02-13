const fs = require('fs');
const path = require('path');
require('dotenv').config();
const AppDataSource = require('../src/config/database');

/**
 * Script de migración URGENTE del CSV antiguo a la nueva base de datos
 * 
 * Migra los 1,021 registros del archivo DB_almacen.csv
 * 
 * Uso: node migrar_csv_urgente.js
 */

async function migrarCSV() {
    console.log('🚀 Iniciando migración urgente del CSV...\n');

    try {
        // Inicializar conexión a BD
        console.log('📡 Conectando a base de datos...');
        await AppDataSource.initialize();
        console.log('✅ Conectado a MySQL\n');

        // Obtener repositorios
        const productoRepo = AppDataSource.getRepository('Producto');
        const clienteRepo = AppDataSource.getRepository('Cliente');
        const loteRepo = AppDataSource.getRepository('Lote');

        // Leer archivo CSV
        const csvPath = path.join(__dirname, '../../../DATAA/DB_almacen.csv');
        console.log('📄 Leyendo CSV:', csvPath);

        if (!fs.existsSync(csvPath)) {
            throw new Error('❌ Archivo CSV no encontrado: ' + csvPath);
        }

        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lineas = csvContent.split('\n').filter(l => l.trim());

        console.log('📊 Total de líneas:', lineas.length);
        console.log('📊 Registros a migrar:', lineas.length - 1, '\n');

        // Parsear headers
        const headers = lineas[0].split(';').map(h => h.trim());
        console.log('📋 Columnas detectadas:', headers.length);
        console.log('📋 Headers:', headers.slice(0, 10).join(' | '), '...\n');

        // Contadores
        let clientesCreados = 0;
        let productosCreados = 0;
        let lotesCreados = 0;
        let errores = 0;

        // Mapas para evitar duplicados
        const clientesMap = new Map();
        const productosMap = new Map();

        // Procesar cada línea
        for (let i = 1; i < lineas.length; i++) {
            try {
                const valores = lineas[i].split(';').map(v => v.trim());

                // Extraer datos según estructura real del CSV
                // 0: Lote, 1: Reg Sanitario, 2: RUC, 3: Código Cliente, 4: Proveedor
                // 5: Razón Social, 6: Fecha Ingreso, 7: Fecha Vcto, 8: T.Documento
                // 9: Nº Documento, 10: Código Interno, 11: Unidad, 12: UM, 13: Temp
                // 14: Cant.Bulto, 15: Cant.Cajas, 16: Cant.x Caja, 17: Cant.Fracción
                // 18: Cantidad Total, 19: Fabricante, 20: Procedencia, 21: Observaciones

                const lote = valores[0] || '';
                const regSanitario = valores[1] || '';
                const ruc = valores[2] || '';
                const codigoCliente = valores[3] || '';
                const proveedor = valores[4] || '';
                const razonSocial = valores[5] || '';
                const fechaIngreso = valores[6] || '';
                const fechaVcto = valores[7] || '';
                const tipoDocumento = valores[8] || '';
                const nroDocumento = valores[9] || '';
                const codigoInterno = valores[10] || '';
                const unidad = valores[11] || 'UND';
                const um = valores[12] || '';
                const temperatura = valores[13] || '';
                const cantBulto = valores[14] || '0';
                const cantCajas = valores[15] || '0';
                const cantPorCaja = valores[16] || '0';
                const cantFraccion = valores[17] || '0';
                const cantTotal = valores[18] || '0';
                const fabricante = valores[19] || '';
                const procedencia = valores[20] || '';
                const observaciones = valores[21] || '';

                // Validar datos mínimos
                if (!lote || !codigoCliente) {
                    console.log(`⚠️  Línea ${i}: Datos incompletos, saltando...`);
                    continue;
                }

                // 1. CREAR/BUSCAR CLIENTE
                let cliente = null;
                const clienteKey = ruc || codigoCliente;

                if (clienteKey && !clientesMap.has(clienteKey)) {
                    cliente = await clienteRepo.findOne({
                        where: [
                            { cuit: ruc },
                            { codigo: codigoCliente }
                        ]
                    });

                    if (!cliente) {
                        cliente = clienteRepo.create({
                            codigo: codigoCliente || `CLI-${Date.now()}-${i}`,
                            razon_social: razonSocial || `Cliente ${codigoCliente || ruc}`,
                            cuit: ruc || null,
                            activo: true
                        });
                        await clienteRepo.save(cliente);
                        clientesCreados++;
                        console.log(`✅ Cliente creado: ${cliente.codigo} - ${cliente.razon_social}`);
                    }

                    clientesMap.set(clienteKey, cliente);
                } else if (clienteKey) {
                    cliente = clientesMap.get(clienteKey);
                }

                // 2. CREAR PRODUCTO
                const codigoProducto = codigoInterno || `${codigoCliente}-${lote}`.substring(0, 50);

                if (!productosMap.has(codigoProducto)) {
                    let producto = await productoRepo.findOne({
                        where: { codigo: codigoProducto }
                    });

                    if (!producto) {
                        // Parsear temperatura (ej: "2-8°C")
                        let tempMin = null, tempMax = null;
                        if (temperatura) {
                            const tempMatch = temperatura.match(/(-?\d+)\s*-\s*(-?\d+)/);
                            if (tempMatch) {
                                tempMin = parseFloat(tempMatch[1]);
                                tempMax = parseFloat(tempMatch[2]);
                            }
                        }

                        producto = productoRepo.create({
                            codigo: codigoProducto,
                            descripcion: (proveedor || 'Producto').substring(0, 300),
                            fabricante: fabricante ? fabricante.substring(0, 200) : null,
                            lote: lote.substring(0, 100),
                            registro_sanitario: regSanitario ? regSanitario.substring(0, 100) : null,
                            procedencia: procedencia ? procedencia.substring(0, 200) : null,
                            proveedor: proveedor ? proveedor.substring(0, 200) : null,
                            tipo_documento: tipoDocumento || null,
                            numero_documento: nroDocumento || null,
                            unidad: unidad || 'UND',
                            um: um || null,
                            temperatura_min_c: tempMin,
                            temperatura_max_c: tempMax,
                            cantidad_bultos: parseFloat(cantBulto) || 0,
                            cantidad_cajas: parseFloat(cantCajas) || 0,
                            cantidad_por_caja: parseFloat(cantPorCaja) || 0,
                            cantidad_fraccion: parseFloat(cantFraccion) || 0,
                            cantidad_total: parseFloat(cantTotal) || 0,
                            observaciones: observaciones || null,
                            activo: true,
                            stock_actual: parseFloat(cantTotal) || 0
                        });
                        await productoRepo.save(producto);
                        productosCreados++;

                        // 3. CREAR LOTE
                        const loteObj = loteRepo.create({
                            producto_id: producto.id,
                            numero_lote: lote.substring(0, 100),
                            fecha_vencimiento: fechaVcto ? new Date(fechaVcto) : null,
                            cantidad_ingresada: parseFloat(cantTotal) || 0,
                            cantidad_disponible: parseFloat(cantTotal) || 0
                        });
                        await loteRepo.save(loteObj);
                        lotesCreados++;

                        productosMap.set(codigoProducto, producto);
                    }
                }

                // Progreso cada 50 registros
                if (i % 50 === 0) {
                    console.log(`📊 Progreso: ${i}/${lineas.length - 1} (${Math.round(i / (lineas.length - 1) * 100)}%)`);
                    console.log(`   Clientes: ${clientesCreados} | Productos: ${productosCreados} | Lotes: ${lotesCreados}`);
                }

            } catch (error) {
                errores++;
                console.error(`❌ Error en línea ${i}:`, error.message);
            }
        }

        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('🎉 MIGRACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log(`✅ Clientes creados:  ${clientesCreados}`);
        console.log(`✅ Productos creados: ${productosCreados}`);
        console.log(`✅ Lotes creados:     ${lotesCreados}`);
        console.log(`❌ Errores:           ${errores}`);
        console.log('='.repeat(60) + '\n');

        // Verificar totales en BD
        const totalClientes = await clienteRepo.count();
        const totalProductos = await productoRepo.count();
        const totalLotes = await loteRepo.count();

        console.log('📊 TOTALES EN BASE DE DATOS:');
        console.log(`   Clientes:  ${totalClientes}`);
        console.log(`   Productos: ${totalProductos}`);
        console.log(`   Lotes:     ${totalLotes}\n`);

        await AppDataSource.destroy();
        console.log('✅ Migración finalizada exitosamente!\n');

    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar migración
console.log('\n' + '='.repeat(60));
console.log('🚨 MIGRACIÓN URGENTE - SISTEMA DE ALMACÉN');
console.log('='.repeat(60) + '\n');

migrarCSV().catch(error => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});
