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
            nullable: false
        },
        descripcion: {
            type: 'varchar',
            length: 300,
            nullable: false
        },
        proveedor: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        proveedor_ruc: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        cliente_id: {
            type: 'int',
            nullable: true
        },
        cliente_ruc: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        fabricante: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        procedencia: {
            type: 'varchar',
            length: 200,
            nullable: true
        },
        lote: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        numero_documento: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        tipo_documento: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        fecha_documento: {
            type: 'date',
            nullable: true
        },
        registro_sanitario: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        temperatura_min_c: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        temperatura_max_c: {
            type: 'decimal',
            precision: 5,
            scale: 2,
            nullable: true
        },
        unidad_medida: {
            type: 'varchar',
            length: 50,
            nullable: true
        },
        activo: {
            type: 'smallint',
            nullable: false,
            default: 1
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
            joinColumn: { name: 'cliente_id' },
            nullable: true,
            onDelete: 'SET NULL'
        },
        kardex: {
            type: 'one-to-many',
            target: 'Kardex',
            inverseSide: 'producto'
        },
        lotes: {
            type: 'one-to-many',
            target: 'Lote',
            inverseSide: 'producto'
        },
        alertas: {
            type: 'one-to-many',
            target: 'AlertaVencimiento',
            inverseSide: 'producto'
        }
    }
});