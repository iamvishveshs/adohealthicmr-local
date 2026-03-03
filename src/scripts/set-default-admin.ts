/**
 * Set or reset default admin: username adohealthicmr, password Welcome@25.
 * Run: npx tsx src/scripts/set-default-admin.ts
 */

import { setDefaultAdmin } from '../lib/pg-auth';

async function main() {
  try {
    await setDefaultAdmin();
    console.log('✅ Default admin set: username adohealthicmr, password Welcome@25');
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exit(1);
  }
  process.exit(0);
}

main();
