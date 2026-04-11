const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Usuario',
    tableName: 'usuarios',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        nombre: {
            type: 'varchar',
            length: 200,
            nullable: false
        },
        usuario: {
            type: 'varchar',
            length: 50,
            unique: true,
            nullable: false
        },
        email: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        password: {
            type: 'varchar',
            length: 255,
            nullable: false
        },
        rol_id: {
            type: 'int',
            nullable: false
        },
        activo: {
            type: 'boolean',
            default: true
        },
        ultimo_acceso: {
            type: 'timestamp',
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
        rol: {
            type: 'many-to-one',
            target: 'Rol',
            joinColumn: {
                name: 'rol_id'
            }
        }
    }
});
