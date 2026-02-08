const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Rol',
    tableName: 'roles',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        nombre: {
            type: 'varchar',
            length: 100,
            unique: true,
            nullable: false
        },
        descripcion: {
            type: 'text',
            nullable: true
        },
        permisos: {
            type: 'json',
            nullable: true
        },
        activo: {
            type: 'boolean',
            default: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    }
});
