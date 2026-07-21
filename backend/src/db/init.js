require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function init() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== '1') throw new Error('Set ALLOW_SCHEMA_MIGRATION=1 for schema setup');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log('Base schema setup complete');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch((error) => {
  console.error('Schema setup failed:', error.message);
  process.exitCode = 1;
});
