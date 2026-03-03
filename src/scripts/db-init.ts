/**
 * Initialize PostgreSQL schema (users, otps, login_history) and ensure default admin exists.
 * Run: npx tsx src/scripts/db-init.ts
 */

import { ensureAuthSchema, setDefaultAdmin } from '../lib/pg-auth';

async function main() {
  try {
    await ensureAuthSchema();
    await setDefaultAdmin();
    console.log('✅ PostgreSQL schema ready. Default admin: username adohealthicmr, password Welcome@25');
  } catch (e) {
    console.error('❌ DB init failed:', e);
    process.exit(1);
  }
  process.exit(0);
}

main();
