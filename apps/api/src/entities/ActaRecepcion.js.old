const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'ActaRecepcion',
    tableName: 'actas_recepcion',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        nota_ingreso_id: {
            type: 'int',
            nullable: false
        },
        numero_acta: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        fecha_recepcion: {
            type: 'date',
            nullable: false
        },
        responsable_id: {
            type: 'int',
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['CONFORME', 'OBSERVADO'],
            default: 'CONFORME'
        },
        aprobado: {
            type: 'boolean',
            default: false
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
    }
});
