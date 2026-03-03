import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById, getUserByUsername } from '@/lib/pg-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // OTP users: no store record, trust JWT
    if (payload.userId.startsWith('otp:')) return payload;

    // Verify stored user still exists (PostgreSQL)
    const user = (await getUserById(payload.userId)) ?? (await getUserByUsername(payload.username));
    if (!user) return null;

    return payload;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(
  handler: (req: NextRequest, user: JWTPayload, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(req, user, context);
  };
}

export function requireAdmin(
  handler: (req: NextRequest, user: JWTPayload, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(req, user, context);
  };
}
