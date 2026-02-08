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

const robotoFonts = {
    normal: resolveRoboto('Roboto-Regular.ttf') || path.join(localFontPath, 'Roboto-Regular.ttf'),
    bold: resolveRoboto('Roboto-Medium.ttf') || path.join(localFontPath, 'Roboto-Medium.ttf'),
    italics: resolveRoboto('Roboto-Italic.ttf') || path.join(localFontPath, 'Roboto-Italic.ttf'),
    bolditalics: resolveRoboto('Roboto-MediumItalic.ttf') || path.join(localFontPath, 'Roboto-MediumItalic.ttf')
};

const robotoDisponible = Object.values(robotoFonts).every((fontFile) => fs.existsSync(fontFile));

if (!robotoDisponible) {
    throw new Error('No se encontraron fuentes Roboto válidas para PDF');
}

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
