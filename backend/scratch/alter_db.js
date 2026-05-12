require('dotenv').config();
const { query } = require('../src/config/db');

async function run() {
    try {
        console.log("Dropping NOT NULL constraint on phone...");
        await query('ALTER TABLE users ALTER COLUMN phone DROP NOT NULL');
        
        console.log("Dropping UNIQUE constraint on phone...");
        // the unique constraint is typically named users_phone_key
        await query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key');
        
        console.log("Database altered successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
