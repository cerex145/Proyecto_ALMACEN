try {
    const PdfPrinter1 = require('pdfmake');
    console.log('require("pdfmake"):', Object.keys(PdfPrinter1));
} catch (e) { console.log('require("pdfmake") failed:', e.message); }

try {
    const PdfPrinter2 = require('pdfmake/src/printer');
    console.log('require("pdfmake/src/printer"):', typeof PdfPrinter2);
    try {
        new PdfPrinter2({ Roboto: { normal: 'foo' } });
        console.log('Success with src/printer');
    } catch (e) { console.log('Constructor threw with src/printer:', e.message); }
} catch (e) { console.log('require("pdfmake/src/printer") failed:', e.message); }
