#!/usr/bin/env node
/**
 * Migra datos de MySQL (Docker) a PostgreSQL (Supabase).
 *
 * Requisitos:
 * 1. Docker con MySQL corriendo: docker-compose up -d mysql
 * 2. .env con DATABASE_URL apuntando a Supabase
 *
 * Uso:
 *   node scripts/migrate-mysql-to-postgres.js              # solo copia datos (esquema ya debe existir)
 *   node scripts/migrate-mysql-to-postgres.js --init        # crea esquema y copia datos desde MySQL
 *   node scripts/migrate-mysql-to-postgres.js --init --schema-only   # solo crea esquema en Postgres (sin MySQL)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

/** Resuelve el host de DATABASE_URL a IPv4 cuando sea posible. */
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
  } catch (e) {
    if (hostname.startsWith('db.') && hostname.endsWith('.supabase.co')) {
      console.error('');
      console.error('Tu red no tiene IPv6. La conexión directa a Supabase (db.xxx.supabase.co) solo usa IPv6.');
      console.error('Usa la cadena del POOLER (Session o Transaction) desde el dashboard:');
      console.error('  1. Supabase Dashboard → tu proyecto → Connect');
      console.error('  2. Elige "Session pooler" o "Transaction pooler"');
      console.error('  3. Copia la URI y ponla en .env como DATABASE_URL');
      console.error('');
      console.error('Ejemplo de formato pooler (reemplaza REGION y contraseña):');
      console.error('  postgresql://postgres.PROJECT_REF:TU_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres');
      console.error('  (Session = puerto 5432, Transaction = puerto 6543)');
      console.error('');
    } else {
      console.warn('No se pudo resolver IPv4 para', hostname, ':', e.message);
    }
  }
  return { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } };
}

const POOLER_REGIONS = [
  'us-east-2',   // Ohio (por defecto)
  'us-east-1',
  'eu-west-1',
  'ap-southeast-1',
  'eu-central-1',
  'us-west-1',
  'ap-northeast-1',
  'sa-east-1',
];

/** Genera URLs del pooler probando aws-0 y aws-1 por región (Supabase usa uno u otro según proyecto). */
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
  const pgConfig = await getPgConnectionConfig(databaseUrl);
  const pgClient = new Client(pgConfig);
  try {
    await pgClient.connect();
    return pgClient;
  } catch (err) {
    const tryPoolerRegions = async () => {
      const urls = buildPoolerUrls(databaseUrl);
      for (const uri of urls) {
        const c = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
        try {
          await c.connect();
          console.log('Conectado usando pooler (IPv4).');
          return c;
        } catch (e) {
          c.end().catch(() => {});
        }
      }
      return null;
    };
    if (err.message && (err.message.includes('Tenant or user not found') || err.message.includes('ENETUNREACH'))) {
      const url = new URL(databaseUrl);
      const isDirect = url.hostname.startsWith('db.') && url.hostname.endsWith('.supabase.co');
      if (isDirect && err.message.includes('ENETUNREACH')) {
        console.log('Red sin IPv6. Probando pooler en varias regiones...');
      }
      const client = await tryPoolerRegions();
      if (client) return client;
      if (err.message.includes('ENETUNREACH')) {
        console.error('No se pudo conectar por pooler. En Dashboard → Connect copia la URI de "Session pooler" y ponla en .env como DATABASE_URL.');
      } else {
        console.error('No se encontró la región del pooler. En Dashboard → Connect copia la URI de "Session pooler" y ponla en .env como DATABASE_URL.');
      }
    }
    throw err;
  }
}

const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3307,
  user: process.env.MYSQL_USER || 'almacen_user',
  password: process.env.MYSQL_PASSWORD || 'almacen123',
  database: process.env.MYSQL_DATABASE || 'almacen',
};

const TABLE_ORDER = [
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

const SEQUENCES = {
  roles: 'roles_id_seq',
  clientes: 'clientes_id_seq',
  productos: 'productos_id_seq',
  usuarios: 'usuarios_id_seq',
  notas_ingreso: 'notas_ingreso_id_seq',
  nota_ingreso_detalles: 'nota_ingreso_detalles_id_seq',
  lotes: 'lotes_id_seq',
  notas_salida: 'notas_salida_id_seq',
  nota_salida_detalles: 'nota_salida_detalles_id_seq',
  actas_recepcion: 'actas_recepcion_id_seq',
  actas_recepcion_detalles: 'actas_recepcion_detalles_id_seq',
  kardex: 'kardex_id_seq',
  ajustes_stock: 'ajustes_stock_id_seq',
  alertas_vencimiento: 'alertas_vencimiento_id_seq',
  auditorias: 'auditorias_id_seq',
};

function escapePgValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' && !Number.isFinite(val)) return 'NULL';
  if (val instanceof Date) return `'${val.toISOString().replace('T', ' ').slice(0, 19)}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function getMysqlTables(conn) {
  const [rows] = await conn.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
    [MYSQL_CONFIG.database]
  );
  return rows.map((r) => r.TABLE_NAME);
}

async function copyTable(mysqlConn, pgClient, tableName) {
  const [rows] = await mysqlConn.query(`SELECT * FROM \`${tableName}\``);
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 filas (omitido)`);
    return 0;
  }
  const columns = Object.keys(rows[0]).filter((k) => k !== undefined);
  const colList = columns.map((c) => `"${c}"`).join(', ');
  const hasId = columns.includes('id');
  const onConflict = hasId ? ' ON CONFLICT (id) DO NOTHING' : '';
  let inserted = 0;
  for (const row of rows) {
    const values = columns.map((col) => escapePgValue(row[col])).join(', ');
    try {
      await pgClient.query(`INSERT INTO ${tableName} (${colList}) VALUES (${values})${onConflict}`);
      inserted++;
    } catch (err) {
      console.error(`  Error insertando en ${tableName} id=${row.id ?? '?'}: ${err.message}`);
    }
  }
  console.log(`  ${tableName}: ${inserted}/${rows.length} filas`);
  return inserted;
}

async function resetSequences(pgClient) {
  for (const [table, seq] of Object.entries(SEQUENCES)) {
    try {
      const r = await pgClient.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1))`);
      if (r) console.log(`  Secuencia ${seq} actualizada`);
    } catch (e) {
      // tabla puede no tener secuencia o no existir
    }
  }
}

async function runSchema(pgClient) {
  const schemaPath = path.join(__dirname, '..', 'migrations', 'postgres_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('No se encontró migrations/postgres_schema.sql');
    return false;
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');
  // Quitar comentarios y ejecutar por bloques (cada CREATE/INSERT)
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);
  for (const st of statements) {
    try {
      await pgClient.query(st);
    } catch (e) {
      if (!e.message.includes('already exists')) console.warn('Schema:', e.message);
    }
  }
  console.log('Esquema PostgreSQL aplicado.');
  return true;
}

async function main() {
  const runInit = process.argv.includes('--init');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Falta DATABASE_URL en .env (PostgreSQL/Supabase)');
    process.exit(1);
  }

  console.log('Conectando a PostgreSQL (Supabase)...');
  let pgClient;
  try {
    pgClient = await connectPgWithPoolerFallback(databaseUrl);
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  }

  if (runInit) {
    console.log('Aplicando esquema (postgres_schema.sql)...');
    await runSchema(pgClient);
  }

  const schemaOnly = process.argv.includes('--schema-only');
  if (schemaOnly) {
    await pgClient.end();
    console.log('Listo (solo esquema). Para copiar datos desde MySQL, levanta Docker y ejecuta sin --schema-only.');
    return;
  }

  console.log('Conectando a MySQL (Docker)...');
  let mysqlConn;
  try {
    mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
  } catch (err) {
    console.error('No se pudo conectar a MySQL. ¿Está Docker levantado?');
    console.error('  Desde la raíz del proyecto: docker-compose up -d mysql  (o: docker compose up -d mysql)');
    console.error(err.message);
    await pgClient.end();
    process.exit(1);
  }

  try {
    const existingTables = await getMysqlTables(mysqlConn);
    const toCopy = TABLE_ORDER.filter((t) => existingTables.includes(t));
    console.log('Tablas a migrar:', toCopy.join(', '));

    for (const table of toCopy) {
      await copyTable(mysqlConn, pgClient, table);
    }

    console.log('Actualizando secuencias en PostgreSQL...');
    await resetSequences(pgClient);
    console.log('Migración completada.');
  } finally {
    await mysqlConn.end();
    await pgClient.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
