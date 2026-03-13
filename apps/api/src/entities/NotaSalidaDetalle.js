const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'NotaSalidaDetalle',
    tableName: 'nota_salida_detalles',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        nota_salida_id: {
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
            nullable: true
        },
        cantidad: {
            type: 'decimal',
            precision: 10,
            scale: 2,
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
        fabricante: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        temperatura_min_c: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        temperatura_max_c: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        cantidad_total: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: true
        }
    },
    relations: {
        notaSalida: {
            type: 'many-to-one',
            target: 'NotaSalida',
            joinColumn: {
                name: 'nota_salida_id'
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
