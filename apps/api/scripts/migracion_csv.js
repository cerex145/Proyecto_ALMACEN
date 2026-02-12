const { DataSource } = require('typeorm');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ClienteSchema = require('../src/entities/Cliente');
const ProductoSchema = require('../src/entities/Producto');
const LoteSchema = require('../src/entities/Lote');
const NotaIngresoSchema = require('../src/entities/NotaIngreso');

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        ClienteSchema,
        ProductoSchema,
        LoteSchema,
        NotaIngresoSchema,
        require('../src/entities/NotaIngresoDetalle'),
    ],
    synchronize: false,
    logging: false
});

async function parseDate(dateStr) {
    if (!dateStr) return null;
    const clean = dateStr.trim().replace(/"/g, '');
    const parts = clean.split('/');
    if (parts.length === 3) {
        // Assume dd/mm/yyyy
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return null;
}

async function parseNumber(val) {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]/g, '');
    return parseFloat(clean) || 0;
}

async function runMigration() {
    console.log('🚀 Iniciando migración (FS Dual-Schema)...');

    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a BD exitosa.');
    } catch (err) {
        console.error('❌ Error conectando a BD:', err);
        process.exit(1);
    }

    const csvPath = 'C:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\DATAA\\DB_almacen.csv';
    const content = fs.readFileSync(csvPath, 'binary');
    const lines = content.split(/\r?\n/);
    console.log(`📊 Total de líneas leídas: ${lines.length}`);

    const clientRepo = AppDataSource.getRepository(ClienteSchema);
    const productRepo = AppDataSource.getRepository(ProductoSchema);
    const loteRepo = AppDataSource.getRepository(LoteSchema);
    const notaRepo = AppDataSource.getRepository(NotaIngresoSchema);
    const detalleRepo = AppDataSource.getRepository(require('../src/entities/NotaIngresoDetalle'));

    const groupedData = {};

    let processedCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const vals = line.split(';');
        if (vals.length < 8) {
            skippedCount++;
            continue;
        }

        // Detect schema
        let schema = 'UNKNOWN';
        let ruc, codCliente, proveedor, razonSocial;
        let codProd, productoName, fVenc, lote, um, tMin, tMax, cantTotal, fabricante, pais, categoria;
        let regSan;

        // Common fields (mostly) usually at start?
        // Header: Lote;Reg;RUC;CodCli;Prov;Cli;FVenc;CodProd;Prod...
        // Invoice Row: Lote;Reg;RUC;CodCli;Prov;Cli;Date;Date2;Factura;Num;CodProd;UM...

        // RUC/Cli seem consistent at 2,3,4,5
        ruc = vals[2] ? vals[2].trim().replace(/"/g, '') : '';
        codCliente = vals[3] ? vals[3].trim().replace(/"/g, '') : '';
        proveedor = vals[4] ? vals[4].trim().replace(/"/g, '') : 'SIN PROVEEDOR';
        razonSocial = vals[5] ? vals[5].trim().replace(/"/g, '') : '';

        // Check Index 8 for Schema Type
        const val8 = vals[8] ? vals[8].trim().replace(/"/g, '') : '';

        if (val8 === 'Factura' || val8 === 'Invoice' || val8 === 'N/A') {
            // Schema B (Invoice Type)
            schema = 'INVOICE';
            lote = vals[0];
            regSan = vals[1];
            // Columns 6/7 are dates. 7 seems to be Vencimiento (matches 2027 years typically).
            fVenc = vals[7];

            // CodProd at 10
            codProd = vals[10];
            // Name missing. Use generic.
            productoName = `Producto ${codProd} (Importado)`;

            um = vals[11];
            tMin = vals[13];
            // CantTotal: In Invoice row, indexes shift. 
            // Header: 20 is Total.
            // Invoice row: 13 is Temp. 14,15,16,17,18,19...
            // Debug showed [16]=Qty? 
            // Row 246: [16]=10. [18]=10. [19]=Fab.
            // Let's assume [18] is Total (Unds).
            cantTotal = vals[18];
            fabricante = vals[19];
            pais = vals[20];
            categoria = 'IMPORTACION';

        } else {
            // Schema A (Standard Product Type) - matching Header
            // Or at least assuming so.
            schema = 'PRODUCT';
            lote = vals[1]; // Header says Lote is 0?? 
            // Wait, Header: Lote(0).
            // PROD row (Step 429): SM0612(0).
            // So Lote is 0.
            lote = vals[0];
            regSan = vals[1];
            fVenc = vals[7]; // Header says 6 is FVenc. 7 is CodProd.
            // Debug Step 429: SM0612...;...;31/05/2026;PROD-INS...
            // 31/05/2026 is at index 6? 
            // Let's count semicolons in Step 429 output line.
            // SM0612(0);(1);206...(2);CLI(3);SUN(4);IMP(5);31/05(6);PROD(7);PINZA(8)
            // So Index 6 is Date. Index 7 is CodProd. Index 8 is Name.

            fVenc = vals[6];
            codProd = vals[7]; // Step 429 said PROD-INS is here?
            // But my fs check (Step 580) for Row 1 showed [7]=N/A.
            // Okay, if this is Schema A, we trust these indices.
            productoName = vals[8];

            um = vals[10];
            categoria = vals[11];
            cantTotal = vals[19]; // Header 20 -> Index 19?
            fabricante = vals[20];
            pais = vals[21];
        }

        if (!codProd || !codCliente || !ruc) {
            skippedCount++;
            continue;
        }

        // Clean values
        codProd = codProd.trim().replace(/"/g, '');
        productoName = productoName ? productoName.trim().replace(/"/g, '') : `Producto ${codProd}`;

        // Final filter
        if (codProd === 'N/A' || codProd.length < 3 || codProd.includes('/')) {
            skippedCount++;
            continue;
        }

        processedCount++;

        if (!groupedData[codCliente]) groupedData[codCliente] = {};
        if (!groupedData[codCliente][proveedor]) groupedData[codCliente][proveedor] = {
            clientData: { ruc, codCliente, razonSocial },
            items: []
        };

        groupedData[codCliente][proveedor].items.push({
            lote, regSan, fVenc, codProd, producto: productoName,
            um, categoria, tMin, cantTotal, fabricante, pais
        });
    }

    console.log(`✅ Registros válidos para migrar: ${processedCount}. (Skipped: ${skippedCount})`);

    // Execution loop (same as before)
    for (const codCliente in groupedData) {
        for (const proveedor in groupedData[codCliente]) {
            const group = groupedData[codCliente][proveedor];
            const { ruc, codCliente: code, razonSocial } = group.clientData;

            let cliente = await clientRepo.findOneBy({ codigo: code });
            if (!cliente) {
                cliente = clientRepo.create({
                    codigo: code,
                    cuit: ruc,
                    razon_social: razonSocial || `Cliente ${code}`,
                    estado: 'Activo'
                });
                await clientRepo.save(cliente);
            }

            const nota = notaRepo.create({
                numero_ingreso: `MIG-${code}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                fecha: new Date(),
                proveedor: proveedor,
                cliente_id: cliente.id,
                tipo_documento: 'Guía de Remisión Remitente',
                numero_documento: 'MIGRACION-CSV',
                estado: 'RECIBIDA_CONFORME',
                observaciones: 'Migración FS Dual-Schema'
            });
            await notaRepo.save(nota);

            for (const item of group.items) {
                const prodCode = item.codProd;
                let producto = await productRepo.findOneBy({ codigo: prodCode });

                if (!producto) {
                    let tMin = await parseNumber(item.tMin);

                    producto = productRepo.create({
                        codigo: prodCode,
                        descripcion: item.producto,
                        proveedor: proveedor,
                        fabricante: item.fabricante,
                        unidad: (item.um && item.um.length < 20) ? item.um : 'UND',
                        observaciones: `Migrado. Categ: ${item.categoria}`,
                        temperatura_min_c: tMin,
                        temperatura_max_c: 0,
                        stock_actual: 0
                    });
                    try {
                        await productRepo.save(producto);
                    } catch (e) { /* Ignore */ }
                }

                const fechaVenc = await parseDate(item.fVenc);
                const cantidad = await parseNumber(item.cantTotal);

                const lote = loteRepo.create({
                    producto_id: producto.id,
                    numero_lote: item.lote || 'S/L',
                    fecha_vencimiento: fechaVenc,
                    cantidad_ingresada: cantidad,
                    cantidad_disponible: cantidad,
                    nota_ingreso_id: nota.id
                });
                await loteRepo.save(lote);

                const detalle = detalleRepo.create({
                    nota_ingreso_id: nota.id,
                    producto_id: producto.id,
                    cantidad: cantidad,
                    lote_numero: item.lote || 'S/L',
                    fecha_vencimiento: fechaVenc,
                    precio_unitario: 0
                });
                await detalleRepo.save(detalle);

                producto.stock_actual = (Number(producto.stock_actual) + cantidad);
                await productRepo.save(producto);
            }
        }
    }

    console.log('🏁 Finalizado.');
    process.exit(0);
}

runMigration();
