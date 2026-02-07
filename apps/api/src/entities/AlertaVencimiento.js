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
        lote_id: {
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
            nullable: false
        },
        estado: {
            type: 'enum',
            enum: ['VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO', 'DESCARTADO'],
            default: 'VIGENTE'
        },
        dias_faltantes: {
            type: 'int',
            nullable: true
        },
        leida: {
            type: 'boolean',
            default: false
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
