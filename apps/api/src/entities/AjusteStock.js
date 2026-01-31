const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'AjusteStock',
    tableName: 'ajustes_stock',
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
        tipo: {
            type: 'enum',
            enum: ['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'],
            nullable: false
        },
        cantidad: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            nullable: false
        },
        motivo: {
            type: 'varchar',
            length: 300,
            nullable: false
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
