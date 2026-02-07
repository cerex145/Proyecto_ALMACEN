const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Kardex',
    tableName: 'kardex',
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
        lote_numero: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        fecha: {
            type: 'date',
            nullable: false
        },
        tipo_movimiento: {
            type: 'varchar',
            length: 20,
            nullable: false
        },
        documento_tipo: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        documento_id: {
            type: 'int',
            nullable: true
        },
        cantidad_entrada: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        cantidad_salida: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        saldo: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        responsable_id: {
            type: 'int',
            nullable: true
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
        producto: {
            type: 'many-to-one',
            target: 'Producto',
            joinColumn: {
                name: 'producto_id'
            }
        }
    }
});
