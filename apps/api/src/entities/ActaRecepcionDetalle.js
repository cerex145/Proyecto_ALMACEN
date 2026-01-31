const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'ActaRecepcionDetalle',
    tableName: 'acta_recepcion_detalles',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        acta_recepcion_id: {
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
        cantidad_esperada: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        cantidad_recibida: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        diferencia: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: true,
            comment: 'Calculado como cantidad_recibida - cantidad_esperada'
        },
        conforme: {
            type: 'boolean',
            default: true
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
        actaRecepcion: {
            type: 'many-to-one',
            target: 'ActaRecepcion',
            joinColumn: {
                name: 'acta_recepcion_id'
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
