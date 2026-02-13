const { EntitySchema } = require('typeorm');

const ActaRecepcion = new EntitySchema({
    name: 'ActaRecepcion',
    tableName: 'actas_recepcion',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        fecha: {
            type: 'date',
            nullable: false
        },
        tipo_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        numero_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        cliente_id: {
            type: 'int',
            nullable: false
        },
        proveedor: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        tipo_operacion: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        tipo_conteo: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        condicion_temperatura: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        observaciones: {
            type: 'text',
            nullable: true
        },
        estado: {
            type: 'varchar',
            length: 20,
            default: 'activa'
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true
        }
    },
    relations: {
        cliente: {
            type: 'many-to-one',
            target: 'Cliente',
            joinColumn: { name: 'cliente_id' }
        },
        detalles: {
            type: 'one-to-many',
            target: 'ActaRecepcionDetalle',
            inverseSide: 'acta'
        }
    }
});

const ActaRecepcionDetalle = new EntitySchema({
    name: 'ActaRecepcionDetalle',
    tableName: 'actas_recepcion_detalles',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        acta_id: {
            type: 'int',
            nullable: false
        },
        producto_id: {
            type: 'int',
            nullable: false
        },
        producto_codigo: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        producto_nombre: {
            type: 'varchar',
            length: 255,
            nullable: true
        },
        fabricante: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        lote_numero: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        fecha_vencimiento: {
            type: 'date',
            nullable: true
        },
        um: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        temperatura_min: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        temperatura_max: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        cantidad_solicitada: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: false,
            default: 0
        },
        cantidad_recibida: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: false,
            default: 0
        },
        cantidad_bultos: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: true,
            default: 0
        },
        cantidad_cajas: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: true,
            default: 0
        },
        cantidad_por_caja: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: true,
            default: 0
        },
        cantidad_fraccion: {
            type: 'decimal',
            precision: 12,
            scale: 2,
            nullable: true,
            default: 0
        },
        aspecto: {
            type: 'varchar',
            length: 10,
            default: 'EMB'
        },
        observaciones: {
            type: 'text',
            nullable: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    },
    relations: {
        acta: {
            type: 'many-to-one',
            target: 'ActaRecepcion',
            joinColumn: { name: 'acta_id' }
        },
        producto: {
            type: 'many-to-one',
            target: 'Producto',
            joinColumn: { name: 'producto_id' }
        }
    }
});

module.exports = { ActaRecepcion, ActaRecepcionDetalle };
