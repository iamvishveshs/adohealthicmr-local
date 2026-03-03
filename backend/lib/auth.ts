import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  const jwtLib = require('jsonwebtoken');
  return jwtLib.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtLib = require('jsonwebtoken');
    return jwtLib.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const payload = verifyToken(token);
    return payload ?? null;
  } catch {
    return null;
  }
}

export function requireAuth(handler: (req: NextRequest, user: JWTPayload, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return await handler(req, user, context);
    } catch (error) {
      console.error('Error in requireAuth handler:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

export function requireAdmin(handler: (req: NextRequest, user: JWTPayload, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    try {
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
      return await handler(req, user, context);
    } catch (error) {
      console.error('Error in requireAdmin handler:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}
