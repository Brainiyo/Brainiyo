require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  logger.info(`Found ${files.length} migrations to run.`);

  for (const file of files) {
    logger.info(`Executing migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      await pool.query(sql);
      logger.info(`✓ ${file} applied successfully`);
    } catch (err) {
      logger.error(`Error applying ${file}:`, err.message);
      // We continue if it's "already exists" errors for this quick script
      if (!err.message.includes('already exists')) {
        process.exit(1);
      }
    }
  }

  logger.info('All migrations processed! Brainiyo is now connected to Supabase.');
  process.exit(0);
}

runMigrations();
