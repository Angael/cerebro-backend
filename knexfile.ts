// Update with your config settings.

const NODE_ENV = process.env.NODE_ENV ?? 'development'; // when operating from cmd will use dev db

console.log({ NODE_ENV_calculated: NODE_ENV });

require('dotenv').config({ path: 'env/.env.' + NODE_ENV });

module.exports = {
  development: {
    // debug: true,
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
  },

  production: {
    // debug: true,
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
  },
};
