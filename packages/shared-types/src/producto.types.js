module.exports = {
    ProductoFilters: {
        codigo: String,
        lote: String,
        descripcion: String,
        categoria: Number
    },

    CreateProductoDTO: {
        codigo: String,
        descripcion: String,
        proveedor: String,
        tipo_documento: String,
        numero_documento: String,
        registro_sanitario: String,
        lote: String,
        fabricante: String,
        categoria_ingreso: String,
        procedencia: String,
        fecha_vencimiento: String,
        unidad: String,
        unidad_otro: String,
        um: String,
        temperatura_c: Number,
        cantidad_bultos: Number,
        cantidad_cajas: Number,
        cantidad_por_caja: Number,
        cantidad_fraccion: Number,
        cantidad_total: Number,
        observaciones: String,
        stock_actual: Number
    }
};