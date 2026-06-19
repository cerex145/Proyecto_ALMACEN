const fs = require('fs');
const path = require('path');
const { generatePDF } = require('./apps/api/src/services/pdf.service');

async function main() {
    console.log('=== Iniciando simulación de Acta de Recepción con Proveedor = Primer Fabricante ===');

    // 1. Crear el objeto de Acta simulado
    // Nota: El proveedor ahora es "LEPU INTERNATIONAL" (el primer fabricante de la lista de productos)
    const acta = {
        id: 9999,
        tipo_documento: 'Packing List, Invoice y Factura',
        numero_documento: 'SIM-2026-0002',
        tipo_operacion: 'Importación',
        tipo_conteo: 'Conteo al 100%',
        fecha: '2026-06-10T00:00:00.000Z',
        proveedor: 'LEPU INTERNATIONAL', // <-- Auto-llenado con el fabricante!
        observaciones: 'Simulación del acta de recepción con proveedor autocompletado con el fabricante del producto (LEPU INTERNATIONAL).',
        responsable_recepcion: 'ROGER E. BLANCAS RAMOS',
        jefe_almacen: 'JANETH T. NARVAEZ HUAMANI',
        cliente: {
            razon_social: 'MIRET MEDICAL ASOCIADOS S.A.C.',
            cuit: '20605712241'
        },
        detalles: [
            {
                producto_codigo: 'VK01111505',
                producto_nombre: 'VERTEBROPLASTY KIT',
                fabricante: 'LEPU INTERNATIONAL', // primer fabricante
                lote_numero: '20250300006',
                fecha_vencimiento: '2028-02-13T00:00:00.000Z',
                cantidad_solicitada: 50,
                cantidad_recibida: 50,
                aspecto: 'EMB'
            },
            {
                producto_codigo: 'RSC061125-HW45',
                producto_nombre: 'BrilliantTM Introducer Kit 6Fr x 11 cm',
                fabricante: 'LEPU INTERNATIONAL',
                lote_numero: '202512604',
                fecha_vencimiento: '2028-12-10T00:00:00.000Z',
                cantidad_solicitada: 1200,
                cantidad_recibida: 1200,
                aspecto: 'ENV'
            }
        ]
    };

    // Lógica de renderizado copiada de actas-recepcion.routes.js
    const AUXILIAR_RECEPCION = 'ROGER E. BLANCAS RAMOS';
    const JEFA_ALMACEN = 'JANETH T. NARVAEZ HUAMANI';

    const logoPath = path.join(__dirname, 'apps/api/src/assets/logo.png');
    const logoCell = fs.existsSync(logoPath)
        ? {
            image: logoPath,
            fit: [110, 38],
            alignment: 'center',
            margin: [0, 4, 0, 4],
            border: [true, true, true, true]
        }
        : {
            text: 'AGUPAL PERU',
            style: 'brandLogo',
            border: [true, true, true, true]
        };

    const tipoDoc = (acta.tipo_documento || '').toLowerCase();
    const checkPackingList = tipoDoc.includes('packing') || tipoDoc.includes('package');
    const checkInvoice = tipoDoc.includes('invoice');
    const checkGuiaRemision = tipoDoc.includes('guía') || tipoDoc.includes('guia');
    const checkFactura = tipoDoc.includes('factura');

    const tipoOp = (acta.tipo_operation || acta.tipo_operacion || '').toLowerCase();
    const checkImportacion = tipoOp.includes('importa');
    const checkCompraLocal = tipoOp.includes('compra') || tipoOp.includes('local');
    const checkTraslado = tipoOp.includes('traslado');
    const checkDevolucion = tipoOp.includes('devolu');

    const tipoConteo = (acta.tipo_conteo || '').toLowerCase();
    const checkConteo100 = tipoConteo.includes('100');
    const checkConteoMuestreo = tipoConteo.includes('muestreo');
    const checkConteoSinApertura = tipoConteo.includes('sin apertura') || tipoConteo.includes('caja');

    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [15, 15, 15, 15],
        content: [
            {
                text: `N° ${acta.id}`,
                style: 'cornerNumber',
                alignment: 'right',
                margin: [0, 0, 0, 5]
            },
            {
                table: {
                    widths: [120, '*', 80],
                    body: [
                        [
                            logoCell,
                            {
                                text: 'ACTA DE RECEPCION',
                                style: 'mainTitle',
                                border: [true, true, true, true]
                            },
                            {
                                text: 'POE.ALM. 01.01',
                                style: 'codeHeader',
                                border: [true, true, true, true]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 2,
                    vLineWidth: () => 2,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black'
                },
                margin: [0, 0, 0, 2]
            },
            {
                table: {
                    widths: [200, 160, 40, 140],
                    body: [
                        [
                            { text: 'DATOS GENERALES', style: 'sectionHeader', colSpan: 1 },
                            { text: 'TIPO DOCUMENTARIO', style: 'sectionHeader', colSpan: 1 },
                            { text: 'TYPE', style: 'sectionHeader', colSpan: 1 },
                            { text: 'TIPO DE CONTEO Y REVISION', style: 'sectionHeader', colSpan: 1 }
                        ],
                        [
                            {
                                columns: [
                                    { text: 'CLIENTE:', width: 60, style: 'labelBoldSmall' },
                                    { text: acta.cliente?.razon_social || 'No encontrado', width: '*', style: 'dataText' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'PACKING LIST', width: 80, style: 'labelSmall' },
                                    { text: checkPackingList ? 'X' : '', width: 15, style: 'checkbox' },
                                    { text: checkPackingList ? (acta.numero_documento || '') : '', width: '*', style: 'dataTextSmall' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'IMPORTACION', width: 80, style: 'labelSmall' },
                                    { text: checkImportacion ? 'X' : '', width: 15, style: 'checkbox' }
                                ],
                                colSpan: 2,
                                border: [true, true, true, true]
                            },
                            {}
                        ],
                        [
                            {
                                columns: [
                                    { text: 'PROVEEDOR:', width: 60, style: 'labelBoldSmall' },
                                    { text: acta.proveedor || 'No encontrado', width: '*', style: 'dataText' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'INVOICE', width: 50, style: 'labelSmall' },
                                    { text: checkInvoice ? 'X' : '', width: 15, style: 'checkbox' },
                                    { text: (checkInvoice || (!checkPackingList && !checkGuiaRemision && !checkFactura)) ? (acta.numero_documento || '') : '', width: '*', style: 'dataTextSmall' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'COMPRA LOCAL', width: 80, style: 'labelSmall' },
                                    { text: checkCompraLocal ? 'X' : '', width: 15, style: 'checkbox' }
                                ],
                                colSpan: 2,
                                border: [true, true, true, true]
                            },
                            {}
                        ],
                        [
                            {
                                columns: [
                                    { text: 'FECHA:', width: 60, style: 'labelBoldSmall' },
                                    { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: '*', style: 'dataText' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'GUIA REMISION', width: 80, style: 'labelSmall' },
                                    { text: checkGuiaRemision ? 'X' : '', width: 15, style: 'checkbox' },
                                    { text: checkGuiaRemision ? (acta.numero_documento || '') : '', width: '*', style: 'dataTextSmall' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'TRASLADO', width: 80, style: 'labelSmall' },
                                    { text: checkTraslado ? 'X' : '', width: 15, style: 'checkbox' }
                                ],
                                colSpan: 2,
                                border: [true, true, true, true]
                            },
                            {}
                        ],
                        [
                            { text: '', border: [true, false, true, true] },
                            {
                                columns: [
                                    { text: 'FACTURA', width: 50, style: 'labelSmall' },
                                    { text: checkFactura ? 'X' : '', width: 15, style: 'checkbox' },
                                    { text: checkFactura ? (acta.numero_documento || '') : '', width: '*', style: 'dataTextSmall' }
                                ],
                                border: [true, true, true, true]
                            },
                            {
                                columns: [
                                    { text: 'DEVOLUCION', width: 80, style: 'labelSmall' },
                                    { text: checkDevolucion ? 'X' : '', width: 15, style: 'checkbox' }
                                ],
                                colSpan: 2,
                                border: [true, true, true, true]
                            },
                            {}
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 3,
                    paddingRight: () => 3,
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                },
                margin: [0, 0, 0, 2]
            },
            {
                table: {
                    widths: [100, 15, 15],
                    body: [
                        [
                            { text: 'CONTEO AL 100%', style: 'labelSmall' },
                            { text: 'A', style: 'labelBoldSmall', alignment: 'center' },
                            { text: checkConteo100 ? 'X' : '', style: 'checkbox', alignment: 'center' }
                        ],
                        [
                            { text: 'CONTEO POR MUESTREO', style: 'labelSmall' },
                            { text: 'B', style: 'labelBoldSmall', alignment: 'center' },
                            { text: checkConteoMuestreo ? 'X' : '', style: 'checkbox', alignment: 'center' }
                        ],
                        [
                            { text: 'CONT. SIM APERT. DE CAJA', style: 'labelSmall' },
                            { text: 'C', style: 'labelBoldSmall', alignment: 'center' },
                            { text: checkConteoSinApertura ? 'X' : '', style: 'checkbox', alignment: 'center' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 3,
                    paddingRight: () => 3,
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                },
                absolutePosition: { x: 640, y: 92 },
                margin: [0, 0, 0, 2]
            },
            {
                table: {
                    headerRows: 1,
                    widths: [15, 45, '*', 50, 40, 35, 35, 35, 30, 30],
                    body: [
                        [
                            { text: 'N°', style: 'tableHeader', rowSpan: 2 },
                            { text: 'CODIGO PRODUCTO', style: 'tableHeader', rowSpan: 2 },
                            { text: 'DESCRIPCIÓN DEL PRODUCTO', style: 'tableHeader', rowSpan: 2 },
                            { text: 'FABRICANTE', style: 'tableHeader', rowSpan: 2 },
                            { text: 'LOTE/SERIE', style: 'tableHeader', rowSpan: 2 },
                            { text: 'F.VCTO.', style: 'tableHeader', rowSpan: 2 },
                            { text: 'CANT.SOLIC', style: 'tableHeader', rowSpan: 2 },
                            { text: 'CANT.RECI', style: 'tableHeader', rowSpan: 2 },
                            { text: 'ASPECTO', style: 'tableHeader', colSpan: 2 },
                            {}
                        ],
                        [
                            {}, {}, {}, {}, {}, {}, {}, {},
                            { text: 'EMB.', style: 'tableHeaderSmall' },
                            { text: 'ENV.', style: 'tableHeaderSmall' }
                        ],
                        ...acta.detalles.map((d, idx) => [
                            { text: String(idx + 1), style: 'tableCell' },
                            { text: d.producto_codigo || '', style: 'tableCellSmall' },
                            { text: d.producto_nombre || '', style: 'tableCellLeft' },
                            { text: d.fabricante || '', style: 'tableCellSmall' },
                            { text: d.lote_numero || '', style: 'tableCellSmall' },
                            { text: d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '', style: 'tableCellSmall' },
                            { text: parseFloat(d.cantidad_solicitada || 0).toFixed(0), style: 'tableCell' },
                            { text: parseFloat(d.cantidad_recibida || 0).toFixed(0), style: 'tableCell' },
                            { text: '√', style: 'tableCell' },
                            { text: '√', style: 'tableCell' }
                        ])
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 2,
                    paddingRight: () => 2,
                    paddingTop: () => 2,
                    paddingBottom: () => 2,
                    fillColor: (rowIndex) => {
                        return rowIndex === 0 || rowIndex === 1 ? '#d3d3d3' : null;
                    }
                },
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    { text: 'OBSERVACIONES: ', style: 'labelBoldSmall', italics: true },
                    { text: acta.observaciones || '', style: 'dataTextSmall', italics: true }
                ],
                margin: [0, 2, 0, 2]
            },
            {
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [
                            { text: 'RECIBIDO Auxiliar de Recepcion', style: 'firmaHeader', fillColor: '#e5e7eb' },
                            { text: 'Verificado por Jefe de Almacen', style: 'firmaHeader', fillColor: '#e5e7eb' }
                        ],
                        [
                            {
                                columns: [
                                    { text: 'NOMBRE:', width: 50, style: 'labelSmall' },
                                    { text: acta.responsable_recepcion || AUXILIAR_RECEPCION, width: '*', style: 'firmaNombre' }
                                ]
                            },
                            {
                                columns: [
                                    { text: 'NOMBRE:', width: 50, style: 'labelSmall' },
                                    { text: acta.jefe_almacen || JEFA_ALMACEN, width: '*', style: 'firmaNombre' }
                                ]
                            }
                        ],
                        [
                            { text: '', margin: [0, 15, 0, 15] },
                            { text: '', margin: [0, 15, 0, 15] }
                        ],
                        [
                            {
                                columns: [
                                    { text: 'FECHA:', width: 40, style: 'labelSmall' },
                                    { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: 60, style: 'dataTextSmall' },
                                    { text: 'FIRMA', width: '*', style: 'labelSmall', alignment: 'right' }
                                ]
                            },
                            {
                                columns: [
                                    { text: 'FECHA:', width: 40, style: 'labelSmall' },
                                    { text: new Date(acta.fecha).toLocaleDateString('es-PE'), width: 60, style: 'dataTextSmall' },
                                    { text: 'FIRMA Y SELLO', width: '*', style: 'labelSmall', alignment: 'right' }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 3,
                    paddingRight: () => 3,
                    paddingTop: () => 2,
                    paddingBottom: () => 2
                },
                margin: [0, 2, 0, 2]
            },
            {
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'LEYENDA', style: 'legendTitle', decoration: 'underline' },
                                    {
                                        columns: [
                                            { text: 'EMB: Embalaje', width: 80, style: 'legendText' },
                                            { text: 'ENV: Envase', width: 70, style: 'legendText' },
                                            { text: '√: Conforme', width: 70, style: 'legendText' },
                                            { text: 'X: No Conforme', width: 80, style: 'legendText' },
                                            { text: 'NA: No Aplica', width: 70, style: 'legendText' },
                                            { text: 'DT: Director Técnico', width: 100, style: 'legendText' },
                                            { text: 'Q.F. A: Farmacéutico Asistente', width: '*', style: 'legendText' }
                                        ],
                                        margin: [0, 2, 0, 2]
                                    },
                                    { text: 'Características de Conformidad:', style: 'legendSubtitle', margin: [0, 2, 0, 1] },
                                    {
                                        text: 'DESCRIPCION: Nombre del producto, Concentración, forma farmacéutica, presentación farmacéutica de acuerdo al documento.',
                                        style: 'legendDetail',
                                        margin: [0, 0, 0, 1]
                                    },
                                    {
                                        text: 'EMBALAJE: Embalaje, Limpio, no arrugado, no roto, no húmedo, no se encuentre abierto, u otro signo que indique deterioro del producto. Corresponde al producto, limpio, no arrugado, no roto, no húmedo, no se encuentre abierto o evidencia que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.',
                                        style: 'legendDetail',
                                        margin: [0, 0, 0, 1]
                                    },
                                    {
                                        text: 'ENVASE: que no ha sido aperturado. Legibles, indelebles y en caso de etiquetas bien adheridas al envase con datos de descripción completos.',
                                        style: 'legendDetail'
                                    }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => 'black',
                    vLineColor: () => 'black',
                    paddingLeft: () => 5,
                    paddingRight: () => 5,
                    paddingTop: () => 3,
                    paddingBottom: () => 3
                },
                margin: [0, 2, 0, 0]
            },
            {
                text: 'FR.ALM.01.01',
                style: 'formCode',
                alignment: 'right',
                margin: [0, 2, 0, 0]
            }
        ],
        styles: {
            cornerNumber: { fontSize: 8, bold: true },
            brandLogo: { fontSize: 14, bold: true, color: '#1e40af', alignment: 'center', margin: [0, 5, 0, 5] },
            mainTitle: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
            codeHeader: { fontSize: 8, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
            sectionHeader: { fontSize: 8, bold: true, fillColor: '#d3d3d3', alignment: 'center', margin: [0, 2, 0, 2] },
            labelBoldSmall: { fontSize: 7, bold: true },
            labelSmall: { fontSize: 7, bold: true },
            dataText: { fontSize: 7 },
            dataTextSmall: { fontSize: 6 },
            checkbox: { fontSize: 10, bold: true },
            tableHeader: { fontSize: 7, bold: true, alignment: 'center', fillColor: '#d3d3d3' },
            tableHeaderSmall: { fontSize: 6, bold: true, alignment: 'center', fillColor: '#d3d3d3' },
            tableCell: { fontSize: 7, alignment: 'center' },
            tableCellSmall: { fontSize: 6, alignment: 'center' },
            tableCellLeft: { fontSize: 6, alignment: 'left' },
            firmaHeader: { fontSize: 7, bold: true, margin: [0, 2, 0, 2] },
            firmaNombre: { fontSize: 7, bold: true, alignment: 'center' },
            legendTitle: { fontSize: 7, bold: true, margin: [0, 0, 0, 2] },
            legendText: { fontSize: 7, bold: true },
            legendSubtitle: { fontSize: 7, bold: true },
            legendDetail: { fontSize: 6 },
            formCode: { fontSize: 8, bold: true }
        }
    };

    try {
        const buffer = await generatePDF(docDefinition);
        const outPath = path.join(__dirname, 'acta_simulada.pdf');
        fs.writeFileSync(outPath, buffer);
        console.log(`✅ PDF generado exitosamente en: ${outPath}`);

        // Copiar a la carpeta de artefactos
        const artifactDir = 'C:\\Users\\Carlos\\.gemini\\antigravity\\brain\\f4b31985-c9de-41b5-9f3a-2a298a6d1b8e';
        const artifactPath = path.join(artifactDir, 'acta_simulada.pdf');
        if (fs.existsSync(artifactDir)) {
            fs.copyFileSync(outPath, artifactPath);
            console.log(`✅ PDF copiado a artefactos en: ${artifactPath}`);
        }
    } catch (err) {
        console.error('❌ Error generando PDF:', err);
    }
}

main();
