const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Producto',
    tableName: 'productos',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        codigo: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        descripcion: {
            type: 'varchar',
            length: 300,
            nullable: false
        },
        proveedor: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        tipo_documento: {
            type: 'enum',
            enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'],
            nullable: true
        },
        numero_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        registro_sanitario: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        lote: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        fabricante: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        categoria_ingreso: {
            type: 'enum',
            enum: ['IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION'],
            nullable: true
        },
        procedencia: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        fecha_vencimiento: {
            type: 'date',
            nullable: true
        },
        unidad: {
            type: 'varchar',
            length: 20,
            default: 'UND'
        },
        unidad_otro: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        um: {
            type: 'enum',
            enum: ['', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G'],
            nullable: true
        },
        temperatura_min_c: {
            type: 'decimal',
            precision: 6,
            scale: 2,
            nullable: true
        },
        temperatura_max_c: {
            type: 'decimal',
            precision: 6,
            scale: 2,
            nullable: true
        },
        cantidad_bultos: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        cantidad_cajas: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        cantidad_por_caja: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        cantidad_fraccion: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        cantidad_total: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        observaciones: {
            type: 'text',
            nullable: true
        },
        stock_actual: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        activo: {
            type: 'boolean',
            default: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true
        }
    }
});