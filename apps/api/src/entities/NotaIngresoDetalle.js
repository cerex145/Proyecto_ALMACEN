const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'NotaIngresoDetalle',
    tableName: 'nota_ingreso_detalles',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        nota_ingreso_id: {
            type: 'int',
            nullable: false
        },
        producto_id: {
            type: 'int',
            nullable: false
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
        cantidad: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        precio_unitario: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: true
        },
        cantidad_bultos: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            nullable: true
        },
        cantidad_cajas: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            nullable: true
        },
        cantidad_por_caja: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            nullable: true
        },
        cantidad_fraccion: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            nullable: true
        },
        cantidad_total: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            nullable: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    },
    relations: {
        notaIngreso: {
            type: 'many-to-one',
            target: 'NotaIngreso',
            joinColumn: {
                name: 'nota_ingreso_id'
            }
        },
        producto: {
            type: 'many-to-one',
            target: 'Producto',
            joinColumn: {
                name: 'producto_id'
            }
        }
    }
});
