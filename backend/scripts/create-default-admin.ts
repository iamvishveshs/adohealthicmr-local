/**
 * Default admin is loaded from data/app-data.json on first store load (no MongoDB).
 * Run: npx tsx backend/scripts/create-default-admin.ts
 */

import { getUserByUsername } from '../../src/lib/store';

const DEFAULT_USERNAME = 'adohealthicmr';

function createDefaultAdmin() {
  const user = getUserByUsername(DEFAULT_USERNAME);
  if (user) {
    console.log(`ℹ️  Default admin "${DEFAULT_USERNAME}" already exists in store.`);
  } else {
    console.log('ℹ️  Default admin is created when the app loads data from data/app-data.json.');
    console.log('   Start the server and the admin user (adohealthicmr / Welcome@25) will be available.');
  }
  process.exit(0);
}

createDefaultAdmin();
