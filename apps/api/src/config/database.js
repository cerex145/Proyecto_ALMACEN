const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../entities/*.js'],
  synchronize: process.env.DB_SYNC === 'true', // Use migrations in production; enable only when you want auto-sync
  logging: process.env.DB_LOGGING === 'true', // Enable logging explicitly via env
  charset: 'utf8mb4',
});

module.exports = AppDataSource;
