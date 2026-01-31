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
        telefono: String,
        email: String
    },

    UpdateClienteDTO: {
        codigo: String,
        razon_social: String,
        cuit: String,
        direccion: String,
        telefono: String,
        email: String,
        activo: Boolean
    }
};
