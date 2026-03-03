/**
 * In-Memory OTP Store
 * No database required. Best for learning / small apps / demos.
 * Note: OTPs are lost on server restart. For production, use Redis.
 */

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface OTPRecord {
  otp: string;
  expiresAt: number;
  username: string;
}

// In-memory store: email (lowercase) -> OTPRecord
const otpStore = new Map<string, OTPRecord>();

/**
 * Store OTP for an email
 */
export function setOTP(email: string, username: string): string {
  const otp = generateOTP();
  const key = email.toLowerCase().trim();
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    username: username.trim(),
  });
  return otp;
}

/**
 * Verify OTP and remove if valid
 */
export function verifyAndConsumeOTP(email: string, otp: string): OTPRecord | null {
  const key = email.toLowerCase().trim();
  const data = otpStore.get(key);

  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    otpStore.delete(key);
    return null; // expired
  }
  if (data.otp !== otp.trim()) return null;

  otpStore.delete(key); // one-time use
  return data;
}

/**
 * Check if OTP exists (for rate limiting or debugging)
 */
export function hasOTP(email: string): boolean {
  const key = email.toLowerCase().trim();
  const data = otpStore.get(key);
  return !!data && data.expiresAt >= Date.now();
}
