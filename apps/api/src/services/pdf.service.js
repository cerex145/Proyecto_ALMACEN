const PdfPrinter = require('pdfmake/js/Printer').default || require('pdfmake/js/Printer');
const path = require('path');
const fs = require('fs');

const fontPath = path.join(__dirname, '../assets/fonts/');

const fonts = {
    Roboto: {
        normal: path.join(fontPath, 'Roboto-Regular.ttf'),
        bold: path.join(fontPath, 'Roboto-Medium.ttf'),
        italics: path.join(fontPath, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontPath, 'Roboto-MediumItalic.ttf')
    }
};

const printer = new PdfPrinter(fonts);

const generatePDF = async (docDefinition) => {
    try {
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        return new Promise((resolve, reject) => {
            let chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    } catch (err) {
        throw err;
    }
};

module.exports = { generatePDF };
