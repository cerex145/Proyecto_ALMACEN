const ExcelJS = require('exceljs');
const path = require('path');

async function run() {
  const ingresoPath = 'c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\docs\\INGRESO AFECORP.xlsx';
  const salidaPath = 'c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\docs\\SALIDA AFECORP.xlsx';

  const wbIngreso = new ExcelJS.Workbook();
  await wbIngreso.xlsx.readFile(ingresoPath);
  const shIngreso = wbIngreso.worksheets[0];

  const wbSalida = new ExcelJS.Workbook();
  await wbSalida.xlsx.readFile(salidaPath);
  const shSalida = wbSalida.worksheets[0];

  console.log('--- HEADERS INGRESO ---');
  console.log(shIngreso.getRow(1).values);
  console.log('--- SAMPLE ROW 44 INGRESO ---');
  console.log(shIngreso.getRow(44).values);

  console.log('--- HEADERS SALIDA ---');
  console.log(shSalida.getRow(1).values);
  console.log('--- SAMPLE ROW 47 SALIDA ---');
  console.log(shSalida.getRow(47).values);
}

run().catch(console.error);
