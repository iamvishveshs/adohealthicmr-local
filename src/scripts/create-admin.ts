/**
 * Script to create an admin user in PostgreSQL.
 * Run: npx tsx src/scripts/create-admin.ts
 * Requires DATABASE_URL in .env
 */

import readline from 'readline';
import { createUser, getUserByUsername, ensureAuthSchema } from '../lib/pg-auth';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    await ensureAuthSchema();
    const username = (await question('Enter username: ')).trim();
    const password = await question('Enter password: ');
    const email = (await question('Enter email (optional): ')).trim();

    if (!username || !password) {
      console.error('❌ Username and password are required');
      process.exit(1);
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      console.error(`❌ User with username "${username}" already exists`);
      process.exit(1);
    }

    const admin = await createUser({
      id: `admin-${Date.now()}`,
      username,
      email: email || `${username}@localhost`,
      role: 'admin',
      password,
    });

    console.log('✅ Admin user created successfully (PostgreSQL)!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
