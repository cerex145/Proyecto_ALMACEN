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
        lote_id: {
            type: 'int',
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
        created_at: {
            type: 'timestamp',
            createDate: true
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
        },
        lote: {
            type: 'many-to-one',
            target: 'Lote',
            joinColumn: {
                name: 'lote_id'
            }
        }
    }
});
