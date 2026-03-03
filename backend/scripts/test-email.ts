/**
 * Test Gmail Email Configuration
 * Run: tsx backend/scripts/test-email.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { verifyGmailConnection, sendTestEmail } from '../lib/email';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

async function testEmail() {
  console.log('\n🧪 Testing Gmail Configuration...\n');

  try {
    // Verify connection
    const isReady = await verifyGmailConnection();
    
    if (!isReady) {
      console.log('\n❌ Gmail connection failed.');
      console.log('💡 Make sure you have:');
      console.log('   1. GMAIL_USER and GMAIL_PASS in .env.local');
      console.log('   2. Enabled 2-Step Verification');
      console.log('   3. Generated App Password');
      console.log('   See: GMAIL_SETUP.md\n');
      process.exit(1);
    }

    // Send test email
    console.log('\n📧 Sending test email...');
    await sendTestEmail();
    
    console.log('\n✅ Test completed successfully!');
    console.log('   Check your inbox (and spam folder) for the test email.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check GMAIL_USER and GMAIL_PASS in .env.local');
    console.error('   2. Verify App Password is correct (16 characters, no spaces)');
    console.error('   3. Make sure 2-Step Verification is enabled');
    console.error('   4. See: GMAIL_SETUP.md for detailed instructions\n');
    process.exit(1);
  }
}

testEmail();
