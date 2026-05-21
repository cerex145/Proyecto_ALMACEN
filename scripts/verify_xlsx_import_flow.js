const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');
const http = require('http');

const DB_CONN = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    }).on('error', (e) => reject(e));
  });
}

function getValText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.richText && Array.isArray(val.richText)) {
      return val.richText.map(t => t.text || '').join('').trim();
    }
    if (val.text !== undefined) {
      return String(val.text).trim();
    }
    if (val.result !== undefined) {
      return String(val.result).trim();
    }
  }
  return String(val).trim();
}

function normalizeProductCode(value) {
  return getValText(value).toLowerCase().replace(/\s+/g, ' ');
}

function normalizeText(value) {
  return getValText(value).toLowerCase();
}


function normalizeLote(lote) {
  return String(lote || '').trim().toUpperCase();
}

function normalizeLoteCanonico(lote) {
  return String(lote || '').trim().replace(/[^A-Z0-9]/ig, '').toUpperCase();
}

const loteCoincideCSV = (numeroLote, loteCsv) => {
  const loteCsvNormalizado = normalizeLote(loteCsv);
  const loteCsvCanonico = normalizeLoteCanonico(loteCsv);
  const loteNormalizado = normalizeLote(numeroLote);
  const loteCanonico = normalizeLoteCanonico(numeroLote);

  return loteNormalizado === loteCsvNormalizado
      || loteCanonico === loteCsvCanonico
      || loteNormalizado.includes(loteCsvNormalizado)
      || loteCsvNormalizado.includes(loteNormalizado)
      || (loteCanonico && loteCsvCanonico && (
          loteCanonico.includes(loteCsvCanonico)
          || loteCsvCanonico.includes(loteCanonico)
      ));
};

const findLoteMatch = (lotes, loteCsv) => {
  if (!lotes || lotes.length === 0 || !loteCsv) return null;

  const loteCsvNormalizado = normalizeLote(loteCsv);
  const loteCsvCanonico = normalizeLoteCanonico(loteCsv);

  const exactMatch = lotes.find((l) => {
    const numLote = String(l.numero_lote || l.lote_numero || '');
    const loteNormalizado = normalizeLote(numLote);
    const loteCanonico = normalizeLoteCanonico(numLote);
    return loteNormalizado === loteCsvNormalizado || (loteCanonico && loteCanonico === loteCsvCanonico);
  });

  if (exactMatch) return exactMatch;

  return lotes.find((l) => loteCoincideCSV(String(l.numero_lote || l.lote_numero || ''), loteCsv)) || null;
};

async function main() {
  const client = new Client({
    connectionString: DB_CONN,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('🔍 Buscando cliente AFECORP...');
  const resCliente = await client.query("SELECT * FROM clientes WHERE cuit = '20600124871' LIMIT 1");
  if (resCliente.rows.length === 0) {
    console.error('❌ No se encontró el cliente AFECORP');
    await client.end();
    return;
  }
  const cliente = resCliente.rows[0];
  console.log(`✅ Cliente encontrado: ${cliente.razon_social} (ID: ${cliente.id})`);

  // --- 1. IMPORTAR INGRESOS ---
  console.log('\n--- 1. PROCESANDO INGRESO AFECORP.xlsx ---');
  const ingresoPath = path.join(__dirname, '..', 'docs', 'INGRESO AFECORP.xlsx');
  const ingresoWorkbook = new ExcelJS.Workbook();
  await ingresoWorkbook.xlsx.readFile(ingresoPath);
  const ingresoSheet = ingresoWorkbook.worksheets[0];

  const ingresoRows = [];
  ingresoSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    ingresoRows.push({
      ruc_cliente: getValText(values[1]),
      codigo_producto: getValText(values[2]),
      nombre: getValText(values[3]),
      lote: getValText(values[4]),
      fecha_vencimiento: values[5],
      um: getValText(values[12]),
      fabricante: getValText(values[13]),
      temperatura: getValText(values[14]) || '15-25',
      cantidad_total: Number(values[11] || 0)
    });
  });

  console.log(`Filas detectadas en Ingreso: ${ingresoRows.length}`);

  // Resolver o crear productos via API
  console.log('Resolviendo/creando productos en bloque...');
  const payloadResolver = {
    cliente_id: cliente.id,
    cliente_ruc: cliente.cuit,
    proveedor: 'AFECORP PERU S.A.C.',
    proveedor_ruc: cliente.cuit,
    productos: ingresoRows.map(r => ({
      codigo: r.codigo_producto,
      descripcion: r.nombre,
      lote: r.lote,
      fabricante: r.fabricante,
      um: r.um,
      temperatura: r.temperatura
    }))
  };

  const resResolver = await postJson('/api/productos/resolver-o-crear', payloadResolver);
  if (resResolver.statusCode !== 200) {
    console.error('❌ Error al resolver/crear productos:', resResolver);
    await client.end();
    return;
  }

  const { creados, existentes, data: productosResueltos } = resResolver.data;
  console.log(`✅ Productos procesados: Creados=${creados}, Existentes=${existentes}, Total=${productosResueltos.length}`);

  // Consultar todos los productos en DB para ver cuántos tienen código '-'
  const resKinessences = await client.query("SELECT id, codigo, descripcion FROM productos WHERE codigo = '-'");
  console.log(`\n📊 Productos en la DB con código '-': ${resKinessences.rows.length}`);
  resKinessences.rows.forEach(p => {
    console.log(`  - ID: ${p.id} | Desc: ${p.descripcion}`);
  });

  console.log('✅ Kinessences products checked.');

  // Ahora, crear la Nota de Ingreso y detalles
  console.log('\nCreando Nota de Ingreso...');
  const dbProducts = await client.query('SELECT * FROM productos WHERE cliente_id = $1', [cliente.id]);
  const productsMap = dbProducts.rows;

  const detallesIngreso = ingresoRows.map(row => {
    const isGeneric = !row.codigo_producto || row.codigo_producto === '-' || row.codigo_producto === '--';
    const prod = productsMap.find(p => {
      const codeMatch = normalizeProductCode(p.codigo) === normalizeProductCode(row.codigo_producto);
      if (isGeneric) {
        const descBuscada = normalizeText(row.nombre);
        const descItem = normalizeText(p.descripcion);
        return codeMatch && (descItem === descBuscada || descItem.includes(descBuscada) || descBuscada.includes(descItem));
      }
      return codeMatch;
    });

    if (!prod) {
      throw new Error(`No se encontró producto en DB para fila: ${row.codigo_producto} - ${row.nombre}`);
    }

    return {
      producto_id: prod.id,
      cantidad: row.cantidad_total,
      lote_numero: row.lote,
      fecha_vencimiento: row.fecha_vencimiento ? new Date(row.fecha_vencimiento).toISOString().split('T')[0] : null,
      um: row.um || 'UND',
      fabricante: row.fabricante || '',
      temperatura_min: 15,
      temperatura_max: 25,
      temperatura_min_c: 15,
      temperatura_max_c: 25,
      cantidad_bultos: 0,
      cantidad_cajas: 0,
      cantidad_por_caja: 0,
      cantidad_fraccion: 0,
      cantidad_total: row.cantidad_total
    };
  });

  const payloadIngreso = {
    fecha: '2026-05-21',
    ruc_cliente: cliente.cuit,
    cliente_id: cliente.id,
    proveedor: 'AFECORP PERU S.A.C.',
    tipo_documento: 'Guía de Remisión Remitente',
    numero_documento: 'ING-AFE-001',
    responsable_id: 1,
    observaciones: 'Importación automatizada de prueba',
    detalles: detallesIngreso
  };

  const resIngreso = await postJson('/api/ingresos', payloadIngreso);
  if (resIngreso.statusCode !== 201) {
    console.error('❌ Error al crear Nota de Ingreso:', resIngreso);
    await client.end();
    return;
  }
  const notaIngreso = resIngreso.data.data;
  console.log(`✅ Nota de Ingreso creada con éxito! ID: ${notaIngreso.id}`);

  // Aprobar la Nota de Ingreso para cargar el inventario y crear los lotes
  console.log('Aprobando Nota de Ingreso...');
  const resAprobar = await postJson(`/api/ingresos/${notaIngreso.id}/aprobar`, {});
  if (resAprobar.statusCode !== 200) {
    console.error('❌ Error al aprobar Nota de Ingreso:', resAprobar);
    await client.end();
    return;
  }
  console.log('✅ Nota de Ingreso aprobada con éxito! Lotes e inventario cargados.');

  // --- 2. IMPORTAR SALIDAS ---
  console.log('\n--- 2. PROCESANDO SALIDA AFECORP.xlsx ---');
  const salidaPath = path.join(__dirname, '..', 'docs', 'SALIDA AFECORP.xlsx');
  const salidaWorkbook = new ExcelJS.Workbook();
  await salidaWorkbook.xlsx.readFile(salidaPath);
  const salidaSheet = salidaWorkbook.worksheets[0];

  const salidaRows = [];
  salidaSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    salidaRows.push({
      ruc_cliente: getValText(values[1]),
      codigo_producto: getValText(values[2]),
      nombre: getValText(values[3]),
      lote: getValText(values[4]),
      cantidad_total: Number(values[10] || 0)
    });
  });

  console.log(`Filas detectadas en Salida: ${salidaRows.length}`);

  // Obtener lotes activos de la base de datos
  const resLotes = await client.query('SELECT * FROM lotes WHERE cantidad_disponible > 0');
  const lotesList = resLotes.rows;
  console.log(`Lotes activos en DB: ${lotesList.length}`);

  const dbProductsUpdated = await client.query('SELECT * FROM productos WHERE cliente_id = $1', [cliente.id]);
  const productsUpdatedList = dbProductsUpdated.rows;

  const loteStockRestante = new Map();
  for (const l of lotesList) {
    loteStockRestante.set(l.id, Number(l.cantidad_disponible));
  }

  const detallesSalida = [];
  let skippedRows = 0;

  for (let idx = 0; idx < salidaRows.length; idx++) {
    const row = salidaRows[idx];
    const codigoRaw = row.codigo_producto;
    const nombreRaw = row.nombre;
    const loteRaw = row.lote;
    const qtyNeed = row.cantidad_total;

    const codigo = normalizeText(codigoRaw);
    const codigoCanonico = normalizeProductCode(codigoRaw);
    const codigoNoInformativo = !codigoCanonico || codigo === '-' || codigo === '--';

    // Resolver producto
    const candidatosPorCodigo = productsUpdatedList.filter((p) => {
      const codigoProducto = normalizeText(p.codigo || '');
      const codigoProductoCanonico = normalizeProductCode(p.codigo || '');

      if (codigoNoInformativo) {
        const isProdCodeNoInformativo = !codigoProductoCanonico || codigoProducto === '-' || codigoProducto === '--';
        return isProdCodeNoInformativo;
      }

      return (codigoProducto && (codigoProducto === codigo || codigoProducto.includes(codigo) || codigo.includes(codigoProducto)))
          || (codigoProductoCanonico && codigoCanonico && (
              codigoProductoCanonico === codigoCanonico
              || codigoProductoCanonico.includes(codigoCanonico)
              || codigoCanonico.includes(codigoProductoCanonico)
          ));
    });

    let matchedProd = null;
    if (candidatosPorCodigo.length === 1) {
      matchedProd = candidatosPorCodigo[0];
    } else if (candidatosPorCodigo.length > 1) {
      if (nombreRaw) {
        const nombre = normalizeText(nombreRaw);
        const porNombre = candidatosPorCodigo.filter((p) => {
          const nombreProducto = normalizeText(p.descripcion || p.nombre || '');
          return nombreProducto === nombre
              || nombreProducto.includes(nombre)
              || nombre.includes(nombreProducto);
        });
        matchedProd = porNombre[0] || candidatosPorCodigo[0];
      } else {
        matchedProd = candidatosPorCodigo[0];
      }
    }

    if (!matchedProd) {
      console.error(`❌ No se encontró producto para fila de salida ${idx + 2}: ${codigoRaw} - ${nombreRaw}`);
      skippedRows++;
      continue;
    }

    // Filtrar lotes activos del producto
    const lotesProd = lotesList.filter(l => Number(l.producto_id) === Number(matchedProd.id));
    const matchedLote = findLoteMatch(lotesProd, loteRaw);

    if (!matchedLote) {
      console.error(`❌ No se encontró lote para fila de salida ${idx + 2}: Prod=${matchedProd.descripcion}, Lote=${loteRaw}`);
      skippedRows++;
      continue;
    }

    const available = loteStockRestante.get(matchedLote.id) || 0;
    if (available <= 0) {
      console.error(`❌ Sin stock para fila ${idx + 2}: Prod=${matchedProd.descripcion}, Lote=${loteRaw}, Pedido=${qtyNeed}, Stock=0`);
      skippedRows++;
      continue;
    }

    let allocated = qtyNeed;
    if (qtyNeed > available) {
      console.warn(`⚠️ Fila ${idx + 2}: Stock insuficiente en lote ${matchedLote.numero_lote} (Pedido=${qtyNeed}, Disp=${available}). Ajustando.`);
      allocated = available;
    }

    loteStockRestante.set(matchedLote.id, available - allocated);

    detallesSalida.push({
      producto_id: matchedProd.id,
      cantidad: allocated,
      cant_bulto: 0,
      cant_caja: 0,
      cant_x_caja: 0,
      cant_fraccion: 0,
      lote_id: matchedLote.id
    });
  }

  console.log(`Detalles de salida preparados: ${detallesSalida.length} (Omitidos/Erróneos: ${skippedRows})`);

  const payloadSalida = {
    cliente_id: cliente.id,
    cliente_ruc: cliente.cuit,
    fecha: '2026-05-21',
    tipo_documento: 'Guía de Remisión Remitente',
    numero_documento: 'SAL-AFE-001',
    responsable_id: 1,
    observaciones: 'Salida automatizada de prueba',
    detalles: detallesSalida
  };

  const resSalida = await postJson('/api/salidas', payloadSalida);
  if (resSalida.statusCode !== 201) {
    console.error('❌ Error al crear Nota de Salida:', resSalida);
    await client.end();
    return;
  }
  const notaSalida = resSalida.data.data;
  console.log(`✅ Nota de Salida creada con éxito! ID: ${notaSalida.id}`);

  // Aprobar/Despachar la Nota de Salida
  console.log('Aprobando Nota de Salida (despachar)...');
  const resDespachar = await postJson(`/api/salidas/${notaSalida.id}/despachar`, {});
  if (resDespachar.statusCode !== 200) {
    console.error('❌ Error al despachar Nota de Salida:', resDespachar);
    await client.end();
    return;
  }
  console.log('✅ Nota de Salida despachada con éxito!');

  // --- VERIFICAR CONCORDANCIA TOTAL ---
  const resDetallesSalida = await client.query('SELECT SUM(cantidad) AS total_unidades FROM nota_salida_detalles WHERE nota_salida_id = $1', [notaSalida.id]);
  const totalUnidades = Number(resDetallesSalida.rows[0].total_unidades || 0);

  console.log('\n======================================');
  console.log('🎉 RESULTADO FINAL DEL E2E TEST:');
  console.log(`Total de unidades de salida registradas en la DB: ${totalUnidades}`);
  console.log(`Objetivo esperado (Excel): 18295`);
  console.log('======================================');

  if (totalUnidades === 18295) {
    console.log('🚀 ¡CALCE PERFECTO DEL 100%! El Excel y el sistema coinciden al 100% (18,295 unidades).');
  } else {
    console.error(`❌ DISCREPANCIA: Se importaron ${totalUnidades} de 18,295.`);
  }

  await client.end();
}

main().catch(err => console.error(err));
