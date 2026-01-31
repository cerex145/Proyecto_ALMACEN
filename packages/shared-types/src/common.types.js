module.exports = {
    PaginationParams: {
        page: Number,
        limit: Number,
        orderBy: String,
        order: String
    },

    ApiResponse: {
        success: Boolean,
        data: Object,
        message: String,
        error: String,
        pagination: Object
    }
};
