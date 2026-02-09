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
  synchronize: String(process.env.DB_SYNC).toLowerCase() === 'true',
  logging: String(process.env.DB_LOGGING).toLowerCase() === 'true',
  charset: 'utf8mb4',
});

module.exports = AppDataSource;
