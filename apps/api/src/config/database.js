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
  synchronize: true, // Auto-create tables if missing
  logging: true, // Enable logging to see SQL errors
  charset: 'utf8mb4',
});

module.exports = AppDataSource;
