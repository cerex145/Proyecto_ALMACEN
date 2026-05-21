const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  const clientes = (await client.query('SELECT * FROM clientes')).rows;
  console.log(`Loaded ${clientes.length} clients`);
  
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

      if (!ruc_cliente || !codigo_producto || !lote || !fecha_ingreso) {
          errores.push(`Fila ${rowNumber}: Faltan datos obligatorios (ruc_cliente, codigo_producto, lote, fecha_ingreso). Values: ruc=${ruc_cliente}, cod=${codigo_producto}, lote=${lote}, fecha_ingreso=${fecha_ingreso}`);
          return;
      }

      const rucNormalizado = normalizarRuc(ruc_cliente);
      const cliente = clientes.find((c) => normalizarRuc(c.cuit) === rucNormalizado);
      if (!cliente) {
          errores.push(`Fila ${rowNumber}: Cliente con RUC ${ruc_cliente} no encontrado`);
          return;
      }

      const fechaIngresoParsed = parseFecha(fecha_ingreso);
      const fechaVencParsed = parseFecha(fecha_vencimiento);
      if (!fechaIngresoParsed) {
          errores.push(`Fila ${rowNumber}: fecha_ingreso inválida`);
          return;
      }
      if (fecha_vencimiento && !fechaVencParsed) {
          errores.push(`Fila ${rowNumber}: fecha_vencimiento inválida`);
          return;
      }

      const bultos = parseNumero(cantidad_bultos) || 0;
      const cajas = parseNumero(cantidad_cajas) || 0;
      const porCaja = parseNumero(cantidad_por_caja) || 0;
      const fraccion = parseNumero(cantidad_fraccion) || 0;
      const totalIngresado = parseNumero(cantidad_total);
      const totalCalculado = (bultos * cajas * porCaja) + fraccion;
      const totalFinal = totalIngresado !== null ? totalIngresado : totalCalculado;

      if (!Number.isFinite(totalFinal) || totalFinal <= 0) {
          errores.push(`Fila ${rowNumber}: cantidad_total inválida (debe ser > 0)`);
          return;
      }

      const tempMin = parseNumero(temperatura_min) || 15;
      const tempMax = parseNumero(temperatura_max) || 25;

      detallesActuales.push({
          rowNumber,
          fecha: fechaIngresoParsed,
          cliente_id: Number(cliente.id),
          codigo_producto: String(codigo_producto).trim(),
          lote_numero: String(lote).trim(),
          fecha_vencimiento: fechaVencParsed,
          cantidad: totalFinal
      });
  });

  console.log(`Parsed successfully count: ${detallesActuales.length}`);
  console.log(`Errors count: ${errores.length}`);
  if (errores.length > 0) {
    console.log('First 5 errors:');
    console.log(errores.slice(0, 5));
  }

  await client.end();
}

main().catch(err => console.error(err));
