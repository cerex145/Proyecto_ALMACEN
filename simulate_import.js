const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  
  const errores = [];
  const detallesActuales = [];

  const normalizarRuc = (value) => String(value || '').replace(/\D/g, '').trim();
  const parseNumero = (value) => {
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'number') return value;
      const clean = String(value).trim().replace(',', '.').replace(/[^0-9.-]/g, '');
      if (!clean) return null;
      const parsed = Number(clean);
      return Number.isFinite(parsed) ? parsed : null;
  };
  const parseFecha = (value) => {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const [
          ruc_cliente,
          codigo_producto,
          lote,
          fecha_vencimiento,
          fecha_ingreso,
          cantidad_bultos,
          cantidad_cajas,
          cantidad_por_caja,
          cantidad_fraccion,
          cantidad_total,
          um,
          fabricante,
          temperatura_min,
          temperatura_max,
          responsable
      ] = row.values.slice(1);

      const rucNormalizado = normalizarRuc(ruc_cliente);
      const fechaIngresoParsed = parseFecha(fecha_ingreso);
      const fechaVencParsed = parseFecha(fecha_vencimiento);
      
      const bultos = parseNumero(cantidad_bultos) || 0;
      const cajas = parseNumero(cantidad_cajas) || 0;
      const porCaja = parseNumero(cantidad_por_caja) || 0;
      const fraccion = parseNumero(cantidad_fraccion) || 0;
      const totalIngresado = parseNumero(cantidad_total);
      const totalCalculado = (bultos * cajas * porCaja) + fraccion;
      const totalFinal = totalIngresado !== null ? totalIngresado : totalCalculado;

      const tempMin = parseNumero(temperatura_min) || 15;
      const tempMax = parseNumero(temperatura_max) || 25;

      detallesActuales.push({
          rowNumber,
          fecha: fechaIngresoParsed,
          codigo_producto: String(codigo_producto).trim(),
          lote_numero: String(lote).trim(),
          fecha_vencimiento: fechaVencParsed,
          cantidad: totalFinal,
          cantidad_bultos: bultos,
          cantidad_cajas: cajas,
          cantidad_por_caja: porCaja,
          cantidad_fraccion: fraccion,
          cantidad_total: totalFinal,
          um: um ? String(um).trim() : null,
          fabricante: fabricante ? String(fabricante).trim() : null,
          temperatura_min_c: tempMin,
          temperatura_max_c: tempMax
      });
  });

  console.log('Simulated parsed rows count:', detallesActuales.length);
  
  // Let's group by product code + lote to see if there are duplicates in the parsed output
  const uniqueKeys = new Map();
  for (const d of detallesActuales) {
    const key = `${d.codigo_producto}|${d.lote_numero}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.set(key, []);
    }
    uniqueKeys.get(key).push(d);
  }

  console.log('Unique parsed keys (codigo_producto + lote_numero):', uniqueKeys.size);

  // Let's see if there are duplicates and print them
  let duplicatesCount = 0;
  for (const [key, list] of uniqueKeys.entries()) {
    if (list.length > 1) {
      duplicatesCount++;
      console.log(`\nDuplicate key: "${key.replace(/\n/g, ' ')}" found ${list.length} times:`);
      for (const item of list) {
        console.log(`  - Row ${item.rowNumber}: Qty=${item.cantidad}, Lote=${item.lote_numero}, Venc=${item.fecha_vencimiento?.toISOString()}`);
      }
    }
  }
  console.log(`\nTotal duplicate keys: ${duplicatesCount}`);
}

main().catch(err => console.error(err));
