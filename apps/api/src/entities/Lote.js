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
            length: 100,
            nullable: false
        },
        fecha_vencimiento: {
            type: 'date',
            nullable: true
        },
        cantidad_inicial: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: true
        },
        cantidad_actual: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['ACTIVO', 'VENCIDO', 'AGOTADO'],
            default: 'ACTIVO'
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
        producto: {
            type: 'many-to-one',
            target: 'Producto',
            joinColumn: {
                name: 'producto_id'
            }
        }
    }
});
