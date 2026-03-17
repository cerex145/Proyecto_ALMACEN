#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeo de RUCs a nombres de cliente
const CLIENTE_NOMBRES = {
  '20600124871': 'AFECORP',
  '20610696571': 'IMPORTACIONES_MEDICAS_RZ',
  '20605712241': 'MIRET_MEDICAL',
  '20608438018': 'SUMEDIN',
  '20612226211': 'SUNIX_MEDICAL',
  '20606511991': 'TRAUMA_SPINE'
};

const ARCHIVO_ENTRADA = '/home/ezku/CEREX/Proyecto_ALMACEN/ingreso.csv';
const DIR_SALIDA = '/home/ezku/CEREX/Proyecto_ALMACEN/ingreso_por_cliente';

// Crear directorio de salida
if (!fs.existsSync(DIR_SALIDA)) {
  fs.mkdirSync(DIR_SALIDA, { recursive: true });
  console.log(`✅ Directorio creado: ${DIR_SALIDA}`);
}

// Leer archivo
const contenido = fs.readFileSync(ARCHIVO_ENTRADA, 'utf-8');
const lineas = contenido.split('\n');
const encabezado = lineas[0];

// Separar por RUC
const archivos = {};

for (let i = 1; i < lineas.length; i++) {
  const linea = lineas[i].trim();
  if (!linea) continue;

  const campos = linea.split(';');
  
  // El RUC está en la columna 17 (índice 16: "RUC")
  // Según el header: ...AÑO RUC AÑO
  // Buscando la posición correcta
  let ruc = '';
  
  // Intentar encontrar el RUC buscando entre los campos
  for (let j = 0; j < campos.length; j++) {
    const valor = campos[j].trim();
    if (valor.match(/^206\d{8}$/) || valor.match(/^206\d{8}$/)) {
      ruc = valor;
      break;
    }
  }

  if (!ruc) {
    console.warn(`⚠️  Fila ${i + 1}: No se encontró RUC válido`);
    continue;
  }

  if (!archivos[ruc]) {
    archivos[ruc] = [];
  }
  archivos[ruc].push(linea);
}

// Crear archivos separados
let totalArchivos = 0;
let totalFilas = 0;

for (const [ruc, filas] of Object.entries(archivos)) {
  const nombreCliente = CLIENTE_NOMBRES[ruc] || `CLIENTE_${ruc}`;
  const nombreArchivo = `ingreso_${nombreCliente}.csv`;
  const rutaArchivo = path.join(DIR_SALIDA, nombreArchivo);

  const contenidoSalida = [encabezado, ...filas].join('\n');
  fs.writeFileSync(rutaArchivo, contenidoSalida, 'utf-8');

  totalArchivos++;
  totalFilas += filas.length;

  console.log(`✅ ${nombreArchivo} - ${filas.length} filas`);
}

console.log(`\n📊 RESUMEN:`);
console.log(`   Archivos generados: ${totalArchivos}`);
console.log(`   Total de filas procesadas: ${totalFilas}`);
console.log(`   Ubicación: ${DIR_SALIDA}\n`);
