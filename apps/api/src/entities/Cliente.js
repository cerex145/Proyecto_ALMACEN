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
        activo: {
            type: 'smallint',
            default: 1,
            nullable: true
        }
    }
});
