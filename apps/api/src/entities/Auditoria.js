const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Auditoria',
    tableName: 'auditorias',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true
        },
        usuario_id: {
            type: 'int',
            nullable: true
        },
        accion: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        tabla_afectada: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        registro_id: {
            type: 'int',
            nullable: true
        },
        valores_anteriores: {
            type: 'json',
            nullable: true
        },
        valores_nuevos: {
            type: 'json',
            nullable: true
        },
        ip_address: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        user_agent: {
            type: 'text',
            nullable: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    }
});
