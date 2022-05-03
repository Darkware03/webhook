const path = require('path');

const envFile = process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env';

require('dotenv').config({
  path: path.resolve(envFile),
});

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'api_node',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
};
