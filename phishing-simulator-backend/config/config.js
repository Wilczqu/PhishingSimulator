require('dotenv').config(); // Load .env file contents into process.env

module.exports = {
  development: {
    username: process.env.DB_USER,       // e.g. 'postgres'
    password: process.env.DB_PASSWORD,   // e.g. 'postgres'
    database: process.env.DB_NAME,       // e.g. 'phishingdb'
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,            // e.g. 'localhost' or 'db'
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Corrected line
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: 'postgres',
  },
};
