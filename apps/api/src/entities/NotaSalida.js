const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'NotaSalida',
    tableName: 'notas_salida',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        numero_salida: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        cliente_id: {
            type: 'int',
            nullable: false
        },
        fecha: {
            type: 'date',
            nullable: false
        },
        responsable_id: {
            type: 'int',
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['REGISTRADA', 'DESPACHO_PENDIENTE', 'DESPACHADA'],
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
            joinColumn: { name: 'cliente_id' }
        },
        // responsable: {
        //     type: 'many-to-one',
        //     target: 'Usuario',
        //     joinColumn: { name: 'responsable_id' }
        // },
        detalles: {
            type: 'one-to-many',
            target: 'NotaSalidaDetalle',
            inverseSide: 'nota_salida'
        }
    }
});
