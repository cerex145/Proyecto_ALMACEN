try {
    const PdfPrinter = require('pdfmake/js/Printer');
    console.log('require("pdfmake/js/Printer"):', typeof PdfPrinter);
    if (typeof PdfPrinter === 'object' && PdfPrinter.default) {
        console.log('Has default export');
        const PrinterClass = PdfPrinter.default;
        new PrinterClass({ Roboto: { normal: 'foo' } });
        console.log('Instantiated via .default');
    } else {
        new PdfPrinter({ Roboto: { normal: 'foo' } });
        console.log('Instantiated directly');
    }
} catch (e) { console.log('require("pdfmake/js/Printer") failed:', e.message); }
