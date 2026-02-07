const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Lote',
    tableName: 'lotes',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        producto_id: {
            type: 'int',
            nullable: false
        },
        numero_lote: {
            type: 'varchar',
            length: 50,
            nullable: false
        },

        fecha_vencimiento: {
            type: 'date',
            nullable: true
        },
        stock_lote: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        proveedor: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        activo: {
            type: 'boolean',
            default: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    },
    relations: {
        producto: {
            type: 'many-to-one',
            target: 'Producto',
            joinColumn: {
                name: 'producto_id'
            }
        }
    }
});
