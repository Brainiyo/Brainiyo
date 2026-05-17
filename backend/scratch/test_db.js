require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const start = Date.now();
    const res = await pool.query('SELECT NOW() as current_time');
    const end = Date.now();
    console.log('✅ Connection successful!');
    console.log('Database time:', res.rows[0].current_time);
    console.log('Latency:', end - start, 'ms');
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
