const dotenv = require('dotenv');

dotenv.config();

const config = {

  pgHost: process.env.PG_HOST || 'localhost',

  pgPort: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,

  pgUser: process.env.PG_USER,

  pgPassword: process.env.PG_PASSWORD,

  pgDatabase: process.env.PG_DATABASE,
 
  csvFilePath: process.env.CSV_FILE_PATH || '',

  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};

module.exports = config;