const { generatePDF } = require('../apps/api/src/services/pdf.service');

(async () => {
  const buffer = await generatePDF({
    content: [
      { text: 'Verificacion PDF', bold: true },
      'Documento minimo para validar fuentes y generacion.'
    ]
  });

  if (!Buffer.isBuffer(buffer) || buffer.length < 1000) {
    throw new Error('El PDF generado no tiene un buffer valido.');
  }

  if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') {
    throw new Error('El buffer generado no parece ser un PDF.');
  }

  console.log('OK: servicio PDF genera un documento valido.');
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
