const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), override: true });

const useUrl = !!process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL !== 'false';

const AppDataSource = new DataSource({
  type: 'postgres',
  ...(useUrl
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  entities: [__dirname + '/../entities/*.js'],
  synchronize: false,
  logging: String(process.env.DB_LOGGING).toLowerCase() === 'true',
  ...(useUrl && useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = AppDataSource;
