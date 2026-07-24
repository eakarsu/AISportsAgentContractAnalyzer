'use strict';
const bcrypt = require('bcryptjs');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../src/config/database');

async function prepare() {
  if (!['1', 'true'].includes(String(process.env.ALLOW_SCHEMA_MIGRATION || '').toLowerCase())) {
    throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  }
  const sqlFiles = [
    path.resolve(__dirname, '../src/db/schema.sql'),
    ...fs.readdirSync(path.resolve(__dirname, '../migrations')).filter((name) => name.endsWith('.sql')).sort()
      .map((name) => path.resolve(__dirname, '../migrations', name)),
    ...fs.readdirSync(path.resolve(__dirname, '../src/migrations')).filter((name) => name.endsWith('.sql')).sort()
      .map((name) => path.resolve(__dirname, '../src/migrations', name)),
  ];
  for (const file of sqlFiles) await pool.query(fs.readFileSync(file, 'utf8'));

  const email = process.env.PROVISION_ADMIN_EMAIL;
  const password = process.env.PROVISION_ADMIN_PASSWORD;
  const name = process.env.PROVISION_ADMIN_NAME || 'Runtime Admin';
  if (!email || String(password || '').length < 12) throw new Error('Provisioned admin credentials are required');
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(email,password,name,role,email_verified) VALUES($1,$2,$3,'admin',TRUE)
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,role='admin',email_verified=TRUE`,
    [email, passwordHash, name],
  );
}

prepare()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Runtime preparation failed:', error.message);
    await pool.end().catch(() => {});
    process.exitCode = 1;
  });
