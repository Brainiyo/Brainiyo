const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config();

async function test() {
  console.log('--- Connection Test ---');
  
  // Test DB
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    await pool.end();
  }

  // Test Redis
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  try {
    const pong = await redis.ping();
    console.log('✅ Redis connected:', pong);
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  } finally {
    redis.disconnect();
  }
}

test();
