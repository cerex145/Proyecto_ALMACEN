const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'NotaIngreso',
    tableName: 'notas_ingreso',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        numero_ingreso: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        numero_guia: {
            type: 'int',
            nullable: true,
            comment: 'Número de guía autoincremental por nota de ingreso'
        },
        fecha: {
            type: 'date',
            nullable: false
        },
        cliente_id: {
            type: 'int',
            nullable: true
        },
        proveedor: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        tipo_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        numero_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        responsable_id: {
            type: 'int',
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['REGISTRADA', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA_CONFORME', 'RECIBIDA_OBSERVADA'],
            default: 'REGISTRADA'
        },
        observaciones: {
            type: 'text',
            nullable: true
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
        cliente: {
            type: 'many-to-one',
            target: 'Cliente',
            nullable: true,
            joinColumn: { name: 'cliente_id' }
        },
        detalles: {
            type: 'one-to-many',
            target: 'NotaIngresoDetalle',
            inverseSide: 'notaIngreso'
        }
    }
});
