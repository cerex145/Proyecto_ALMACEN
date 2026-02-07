const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Cliente',
    tableName: 'clientes',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        codigo: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        razon_social: {
            type: 'varchar',
            length: 200,
            nullable: false
        },
        cuit: {
            type: 'varchar',
            length: 11,
            nullable: false
        },
        direccion: {
            type: 'varchar',
            length: 300,
            nullable: true
        },
        telefono: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        email: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        activo: {
            type: 'boolean',
            default: true
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
