module.exports = {
    AjusteStockTipos: {
        AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
        AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO'
    },

    CreateAjusteDTO: {
        producto_id: Number,
        tipo: String,
        cantidad: Number,
        motivo: String,
        observaciones: String
    },

    AjusteFilters: {
        producto_id: Number,
        tipo: String,
        fecha_desde: String,
        fecha_hasta: String
    }
};
