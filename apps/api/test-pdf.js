const { generatePDF } = require('./src/services/pdf.service');

(async () => {
    try {
        console.log('Generating PDF...');
        const buffer = await generatePDF({
            content: 'Test PDF Content'
        });
        console.log('PDF generated successfully, size:', buffer.length);
    } catch (err) {
        console.error('Error generating PDF:', err);
        process.exit(1);
    }
})();
