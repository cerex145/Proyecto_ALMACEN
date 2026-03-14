#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const dns = require('dns').promises;

const TABLES = [
  'roles',
  'clientes',
  'productos',
  'usuarios',
  'notas_ingreso',
  'nota_ingreso_detalles',
  'lotes',
  'notas_salida',
  'nota_salida_detalles',
  'actas_recepcion',
  'actas_recepcion_detalles',
  'kardex',
  'ajustes_stock',
  'alertas_vencimiento',
  'auditorias',
];

const POOLER_REGIONS = [
  'us-east-2',
  'us-east-1',
  'eu-west-1',
  'ap-southeast-1',
  'eu-central-1',
  'us-west-1',
  'ap-northeast-1',
  'sa-east-1',
];

async function getPgConnectionConfig(databaseUrl) {
  const url = new URL(databaseUrl);
  const hostname = url.hostname;

  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
  }

  try {
    const ips = await dns.resolve(hostname, 'A');
    if (ips && ips.length > 0) {
      url.hostname = ips[0];
      return { connectionString: url.toString(), ssl: { rejectUnauthorized: false } };
    }
  } catch (_) {
    // Ignorar y continuar con hostname original
  }

  return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
}

function buildPoolerUrls(databaseUrl) {
  const url = new URL(databaseUrl);
  const password = url.password;
  let projectRef = null;

  if (url.hostname.startsWith('db.') && url.hostname.endsWith('.supabase.co')) {
    projectRef = url.hostname.replace('db.', '').replace('.supabase.co', '');
  } else if (url.username && url.username.startsWith('postgres.')) {
    projectRef = url.username.replace('postgres.', '');
  }

  if (!projectRef || !password) return [];

  const port = url.port || '5432';
  const urls = [];

  for (const region of POOLER_REGIONS) {
    urls.push(`postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:${port}/postgres`);
    urls.push(`postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-1-${region}.pooler.supabase.com:${port}/postgres`);
  }

  return urls;
}

async function connectPgWithPoolerFallback(databaseUrl) {
  const firstClient = new Client(await getPgConnectionConfig(databaseUrl));

  try {
    await firstClient.connect();
    return firstClient;
  } catch (error) {
    try {
      await firstClient.end();
    } catch (_) {}

    const urls = buildPoolerUrls(databaseUrl);
    for (const uri of urls) {
      const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();
        return client;
      } catch (_) {
        try {
          await client.end();
        } catch (_) {}
      }
    }

    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en .env');
    process.exit(1);
  }

  const mysqlConfig = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3307,
    user: process.env.MYSQL_USER || 'almacen_user',
    password: process.env.MYSQL_PASSWORD || 'almacen123',
    database: process.env.MYSQL_DATABASE || 'almacen',
  };

  const mysqlConn = await mysql.createConnection(mysqlConfig);
  const pgConn = await connectPgWithPoolerFallback(process.env.DATABASE_URL);

  let hasDiff = false;

  console.log('Comparando conteos MySQL vs PostgreSQL...\n');

  for (const table of TABLES) {
    const [[mysqlCount]] = await mysqlConn.query(`SELECT COUNT(*) c FROM ${table}`);
    const pgCount = await pgConn.query(`SELECT COUNT(*)::int c FROM ${table}`);

    const sourceCount = Number(mysqlCount.c || 0);
    const targetCount = Number(pgCount.rows[0].c || 0);

    const status = sourceCount === targetCount ? 'OK  ' : 'DIFF';
    if (status === 'DIFF') hasDiff = true;

    console.log(`${status} ${table.padEnd(24)} mysql=${String(sourceCount).padStart(6)} pg=${String(targetCount).padStart(6)}`);
  }

  await mysqlConn.end();
  await pgConn.end();

  if (hasDiff) {
    console.log('\n⚠️  Se encontraron diferencias de conteo.');
    process.exit(2);
  }

  console.log('\n✅ Verificación exitosa: conteos iguales en todas las tablas.');
}

main().catch((error) => {
  console.error('Error en verificación:', error.message);
  process.exit(1);
});
