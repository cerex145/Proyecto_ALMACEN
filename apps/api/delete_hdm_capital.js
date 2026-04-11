const AppDataSource = require('./src/config/database');

async function run() {
    try {
        await AppDataSource.initialize();
        console.log("Conectado a la base de datos.");
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        const cuit = '20605390332';
        console.log("Buscando cliente HDM CAPITAL...");
        
        let clienteId = null;
        const resClientes = await queryRunner.query(`
            SELECT id, razon_social, cuit FROM clientes 
            WHERE cuit = $1 OR razon_social ILIKE $2
        `, [cuit, '%HDM%CAPITAL%']);
        
        console.log("Clientes encontrados:", resClientes);
        if (resClientes.length > 0) {
            clienteId = resClientes[0].id;
        }

        console.log("=== Analizando Registros ===");

        // 1. Ingresos
        const paramId = clienteId ? clienteId : -1;
        const notasIngreso = await queryRunner.query(`
            SELECT id FROM notas_ingreso 
            WHERE cliente_ruc = $1 
               OR proveedor_ruc = $1 
               OR proveedor ILIKE $2 
               OR cliente_id = $3
        `, [cuit, '%HDM%CAPITAL%', paramId]);
        
        const niIds = notasIngreso.map(r => r.id);
        console.log("Notas Ingreso encontradas:", niIds.length, niIds);

        // 2. Salidas
        const notasSalida = await queryRunner.query(`
            SELECT id FROM notas_salida WHERE cliente_id = $1
        `, [paramId]);
        const nsIds = notasSalida.map(r => r.id);
        console.log("Notas Salida encontradas:", nsIds.length, nsIds);

        if (niIds.length > 0 || nsIds.length > 0) {
            console.log("\nIniciando eliminación en cascada de Kardex, Lotes y Notas...");
            await queryRunner.startTransaction();
            
            try {
                // Eliminar Kardex de Salidas
                if (nsIds.length > 0) {
                    const kardexSalidas = await queryRunner.query(
                        `DELETE FROM kardex WHERE documento_tipo = 'NOTA_SALIDA' AND referencia_id = ANY($1) RETURNING id`, 
                        [nsIds]
                    );
                    console.log(`- Kardex (Salidas) eliminados: ${kardexSalidas.length}`);
                    
                    const deleteNs = await queryRunner.query(
                        `DELETE FROM notas_salida WHERE id = ANY($1)`, 
                        [nsIds]
                    );
                    console.log(`- Notas de Salida eliminadas: ${deleteNs[1]}`);
                }

                // Eliminar Kardex de Ingresos
                if (niIds.length > 0) {
                    const kardexIngresos = await queryRunner.query(
                        `DELETE FROM kardex WHERE documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND referencia_id = ANY($1) RETURNING id`, 
                        [niIds]
                    );
                    console.log(`- Kardex (Ingresos) eliminados: ${kardexIngresos.length}`);
                    
                    // Lotes originados en estos ingresos
                    const deleteLotes = await queryRunner.query(
                        `DELETE FROM lotes WHERE nota_ingreso_id = ANY($1)`, 
                        [niIds]
                    );
                    console.log(`- Lotes relacionados eliminados: ${deleteLotes[1]}`);

                    const deleteNi = await queryRunner.query(
                        `DELETE FROM notas_ingreso WHERE id = ANY($1)`, 
                        [niIds]
                    );
                    console.log(`- Notas de Ingreso eliminadas: ${deleteNi[1]}`);
                }

                await queryRunner.commitTransaction();
                console.log("✅ Eliminación completada con éxito.");
            } catch (err) {
                await queryRunner.rollbackTransaction();
                console.error("❌ Error durante la eliminación, se hizo ROLLBACK:", err);
            }
        } else {
            console.log("No se encontraron registros para eliminar.");
        }

        await queryRunner.release();

    } catch (e) {
        console.error(e);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

run();
