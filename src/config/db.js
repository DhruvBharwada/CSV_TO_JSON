const { Pool } = require('pg');
const config = require('./index');


const pool = new Pool({
  host: config.pgHost,
  port: config.pgPort,
  user: config.pgUser,
  password: config.pgPassword,
  database: config.pgDatabase,
});


module.exports = pool;