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
            name: 'cuit',
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
            type: 'enum',
            enum: ['Bajo', 'Alto', 'No verificado'],
            nullable: true
        },
        estado: {
            type: 'enum',
            enum: ['Activo', 'Inactivo', 'Potencial', 'Blokeado'],
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
