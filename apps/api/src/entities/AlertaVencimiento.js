const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'AlertaVencimiento',
    tableName: 'alertas_vencimiento',
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
        fecha_vencimiento: {
            type: 'date',
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['VENCIDO', 'PROXIMO_A_VENCER', 'NORMAL'],
            default: 'NORMAL'
        },
        dias_para_vencer: {
            type: 'int',
            nullable: true
        },
        cantidad: {
            type: 'int',
            nullable: true,
            default: 0
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
            joinColumn: { name: 'producto_id' },
            nullable: false
        }
    }
});
