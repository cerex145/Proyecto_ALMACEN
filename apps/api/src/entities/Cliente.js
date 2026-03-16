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
            length: 13,
            nullable: true
        },
        direccion: {
            type: 'varchar',
            length: 300,
            nullable: true
        },
        distrito: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        provincia: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        departamento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        categoria_riesgo: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        estado: {
            type: 'varchar',
            length: 50,
            nullable: false,
            default: 'Activo'
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
            type: 'smallint',
            default: 1,
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
            nullable: false
        }
    }
});
