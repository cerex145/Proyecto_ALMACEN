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
        fecha: {
            type: 'date',
            nullable: false
        },
        proveedor: {
            type: 'varchar',
            length: 200,
            nullable: false
        },
        tipo_documento: {
            type: 'enum',
            enum: ['Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra'],
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
        responsable: {
            type: 'many-to-one',
            target: 'Usuario',
            joinColumn: { name: 'responsable_id' }
        },
        detalles: {
            type: 'one-to-many',
            target: 'NotaIngresoDetalle',
            inverseSide: 'nota_ingreso'
        }
    }
});
