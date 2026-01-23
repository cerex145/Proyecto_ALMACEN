const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Producto',
    tableName: 'productos',
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
        descripcion: {
            type: 'varchar',
            length: 300,
            nullable: false
        },
        stock_actual: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
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