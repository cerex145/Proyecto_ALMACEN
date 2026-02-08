const pdfmake = require('pdfmake');
console.log('Type:', typeof pdfmake);
console.log('Keys:', Object.keys(pdfmake));
console.log('Is Function/Class:', typeof pdfmake === 'function');
if (typeof pdfmake === 'object') {
    if (pdfmake.PdfPrinter) console.log('Has PdfPrinter property');
}
try {
    const p = new pdfmake({});
    console.log('Instantiated successfully');
} catch (e) {
    console.log('Constructor failed:', e.message);
}
