require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

function seedConfig() {
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== '1') throw new Error('Set ALLOW_DESTRUCTIVE_SEED=1 to reset and seed the database');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (!/^\S+@\S+\.\S+$/.test(process.env.SEED_ADMIN_EMAIL || '')) throw new Error('SEED_ADMIN_EMAIL is required');
  if ((process.env.SEED_ADMIN_PASSWORD || '').length < 12) throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters');
  return { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD };
}

async function seed() {
  const config = seedConfig();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
    const hash = await bcrypt.hash(config.password, 12);
    await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      [config.email, hash, 'Seed Administrator', 'admin']
    );
    await client.query('COMMIT');
    console.log('Seed data loaded; administrator credentials came from the environment');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
});
