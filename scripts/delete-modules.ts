// Script to delete modules 2-8 using the bulk API
// Run with: npx tsx scripts/delete-modules.ts

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

async function deleteModules() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login first to get auth token
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${error.error || error.message}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success || loginData.user.role !== 'admin') {
      throw new Error('Login failed or user is not an admin');
    }

    console.log('✅ Logged in successfully');

    // Extract cookie from login response
    // In Node.js, Set-Cookie headers are in an array
    const setCookieHeaders = loginResponse.headers.getSetCookie?.() || 
                             loginResponse.headers.get('set-cookie')?.split(',') || [];
    
    let authCookie = '';
    for (const cookieHeader of setCookieHeaders) {
      const cookieMatch = cookieHeader.match(/token=([^;]+)/);
      if (cookieMatch) {
        authCookie = cookieMatch[1];
        break;
      }
    }

    // If cookie extraction failed, try alternative method
    if (!authCookie) {
      // Try getting all headers to debug
      const allHeaders = Array.from(loginResponse.headers.entries());
      console.log('Available headers:', allHeaders);
      
      // Try accessing raw headers
      const rawSetCookie = (loginResponse.headers as any).raw()?.['set-cookie'];
      if (rawSetCookie && Array.isArray(rawSetCookie)) {
        for (const cookie of rawSetCookie) {
          const match = cookie.match(/token=([^;]+)/);
          if (match) {
            authCookie = match[1];
            break;
          }
        }
      }
    }

    if (!authCookie) {
      throw new Error('Failed to extract authentication cookie. Please check your admin credentials and ensure the server is running.');
    }

    // Delete modules 2-8 using bulk API
    const modulesToDelete = [2, 3, 4, 5, 6, 7, 8];
    console.log(`🗑️  Deleting modules: ${modulesToDelete.join(', ')}...`);

    const deleteResponse = await fetch(`${API_URL}/api/bulk`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `token=${authCookie}`,
      },
      body: JSON.stringify({
        operation: 'delete',
        resource: 'modules',
        data: modulesToDelete,
      }),
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      throw new Error(`Delete failed: ${error.error || error.message}`);
    }

    const deleteData = await deleteResponse.json();
    console.log(`✅ Successfully deleted ${deleteData.result.deleted} modules`);
    console.log('📊 Result:', deleteData);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

deleteModules();
