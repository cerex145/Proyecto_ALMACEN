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
        stock_minimo: Number
    }
};