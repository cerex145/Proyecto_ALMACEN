module.exports = {
    ClienteFilters: {
        codigo: String,
        razon_social: String,
        cuit: String,
        activo: Boolean
    },

    CreateClienteDTO: {
        codigo: String,
        razon_social: String,
        cuit: String,
        direccion: String,
        distrito: String,
        provincia: String,
        departamento: String,
        categoria_riesgo: String,
        estado: String,
        telefono: String,
        email: String
    },

    UpdateClienteDTO: {
        codigo: String,
        razon_social: String,
        cuit: String,
        direccion: String,
        distrito: String,
        provincia: String,
        departamento: String,
        categoria_riesgo: String,
        estado: String,
        telefono: String,
        email: String,
        activo: Boolean
    }
};
