const pdfmake = require('pdfmake');
const path = require('path');
const fs = require('fs');

const resolveRoboto = (fileName) => {
    try {
        return require.resolve(`pdfmake/fonts/Roboto/${fileName}`);
    } catch (error) {
        return null;
    }
};

const localFontPath = path.join(__dirname, '../assets/fonts/');

const isValidFontFile = (fontFile) => {
    if (!fontFile || !fs.existsSync(fontFile)) return false;

    const fd = fs.openSync(fontFile, 'r');
    try {
        const header = Buffer.alloc(4);
        fs.readSync(fd, header, 0, 4, 0);
        return header.equals(Buffer.from([0x00, 0x01, 0x00, 0x00]))
            || header.equals(Buffer.from('OTTO'))
            || header.equals(Buffer.from('ttcf'));
    } finally {
        fs.closeSync(fd);
    }
};

const resolveFont = (fileName) => {
    const candidates = [
        resolveRoboto(fileName),
        path.join(localFontPath, fileName)
    ].filter(Boolean);

    const fontFile = candidates.find(isValidFontFile);
    if (!fontFile) {
        throw new Error(`No se encontro una fuente Roboto valida: ${fileName}`);
    }

    return fontFile;
};

const robotoFonts = {
    normal: resolveFont('Roboto-Regular.ttf'),
    bold: resolveFont('Roboto-Medium.ttf'),
    italics: resolveFont('Roboto-Italic.ttf'),
    bolditalics: resolveFont('Roboto-MediumItalic.ttf')
};

const fonts = { Roboto: robotoFonts };
const defaultFontName = 'Roboto';

pdfmake.setFonts(fonts);

const generatePDF = async (docDefinition) => {
    try {
        if (!docDefinition.defaultStyle) {
            docDefinition.defaultStyle = { font: defaultFontName };
        } else if (!docDefinition.defaultStyle.font) {
            docDefinition.defaultStyle.font = defaultFontName;
        }

        const pdfDoc = pdfmake.createPdf(docDefinition);
        return pdfDoc.getBuffer();
    } catch (err) {
        throw err;
    }
};

module.exports = { generatePDF };
