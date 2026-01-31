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
        tipo_movimiento: {
            type: 'enum',
            enum: ['INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'AJUSTE_POR_RECEPCION'],
            nullable: false
        },
        cantidad: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        saldo: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        documento_tipo: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        documento_numero: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        referencia_id: {
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
