require('dotenv').config();
const { pool } = require('./src/config/db');
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%attempt%'")
  .then(r => console.log(r.rows))
  .finally(() => pool.end());
