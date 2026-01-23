module.exports = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    },

    formatNumber(num, decimals = 2) {
        return Number(num).toFixed(decimals);
    }
};