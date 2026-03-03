import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/db';
import {
  ensureAuthSchema,
  getDefaultAdminUser,
  getUserByUsername,
  getUserByEmail,
  verifyUserPassword,
  verifyUserPasswordByEmail,
  verifyDefaultAdminCredentials,
  addLoginHistory,
  createUserByEmail,
} from '@/lib/pg-auth';
import {
  getFallbackUserByEmail,
  createFallbackUser,
  verifyFallbackPassword,
} from '@/lib/fallback-users';
import { generateToken } from '@/backend/lib/auth';
import { getRolePermissions, isValidRole } from '@/backend/lib/roles';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    const isUserLoginByEmail = typeof email === 'string' && email.trim() && typeof password === 'string';
    const isAdminLoginByUsername = typeof username === 'string' && username.trim() && typeof password === 'string';

    if (!isUserLoginByEmail && !isAdminLoginByUsername) {
      return NextResponse.json(
        { error: 'Credentials required', message: 'Use email + password for User Login, or username + password for Admin Login.' },
        { status: 400 }
      );
    }

    // --- User login by email + password ---
    if (isUserLoginByEmail) {
      const trimmedEmail = (email as string).trim().toLowerCase();
      if (!password) {
        return NextResponse.json({ error: 'Password required', message: 'Please enter your password.' }, { status: 400 });
      }

      // Fallback Store (No DB)
      if (!hasDatabase()) {
        let user = await getFallbackUserByEmail(trimmedEmail);
        if (!user) {
          try {
            user = await createFallbackUser(trimmedEmail, password);
          } catch (err) {
            console.error('Create fallback user error:', err);
            return NextResponse.json({ error: 'Sign up failed', message: 'Could not create account.' }, { status: 500 });
          }
        } else {
          if (!verifyFallbackPassword(user, password)) {
            return NextResponse.json({ error: 'Invalid credentials', message: 'Email or password is incorrect' }, { status: 401 });
          }
        }
        const token = generateToken({ userId: user.id, username: user.email, role: user.role });
        const permissions = getRolePermissions(user.role);
        const response = NextResponse.json({
          success: true,
          message: 'User login successful',
          user: { id: user.id, username: user.username, email: user.email, role: user.role },
          permissions: { ...permissions, isAdmin: false, isUser: true },
        });
        response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
        return response;
      }

      // Database Logic
      await ensureAuthSchema();
      let user = await getUserByEmail(trimmedEmail);

      if (!user) {
        try {
          // If DB requires a username field, ensure your createUserByEmail handles it.
          // This call triggers the actual DB INSERT.
          user = await createUserByEmail(trimmedEmail, password);
        } catch (err: any) {
          console.error('Database INSERT failed:', err);

          const isDuplicateError = err?.code === '23505' || err?.message?.includes('duplicate') || err?.message?.includes('exists');

          if (isDuplicateError) {
            user = await getUserByEmail(trimmedEmail);
            if (!user) return NextResponse.json({ error: 'Conflict', message: 'User exists but could not be retrieved.' }, { status: 409 });

            const valid = await verifyUserPasswordByEmail(trimmedEmail, password);
            if (!valid) return NextResponse.json({ error: 'Invalid credentials', message: 'Incorrect password for existing account.' }, { status: 401 });
          } else {
            // This is the source of your 500 error. Check if username column is NOT NULL.
            return NextResponse.json({
              error: 'Database Error',
              message: 'Failed to create user. Check if database schema requires a username.',
              details: err.message
            }, { status: 500 });
          }
        }
      } else {
        const valid = await verifyUserPasswordByEmail(trimmedEmail, password);
        if (!valid) {
          return NextResponse.json({ error: 'Invalid credentials', message: 'Email or password is incorrect' }, { status: 401 });
        }
      }

      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 500 });
      if (!isValidRole(user.role)) return NextResponse.json({ error: 'Invalid role' }, { status: 403 });

      const token = generateToken({ userId: user.id, username: user.username, role: user.role });
      const permissions = getRolePermissions(user.role);

      // Attempt history log (non-blocking)
      try {
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        await addLoginHistory({
          userId: user.id, username: user.username, email: user.email, role: user.role,
          loginAt: new Date(), ipAddress, userAgent: request.headers.get('user-agent')?.substring(0, 500) || 'unknown',
        });
      } catch (e) { console.error('History log failed'); }

      const response = NextResponse.json({
        success: true,
        message: 'User login successful',
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        permissions: { ...permissions, isAdmin: user.role === 'admin', isUser: user.role === 'user' },
      });
      response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
      return response;
    }

    // --- Admin / Username login ---
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

    if (!hasDatabase()) {
      if (verifyDefaultAdminCredentials(username, password)) {
        const user = getDefaultAdminUser();
        const token = generateToken({ userId: user.id, username: user.username, role: user.role });
        const response = NextResponse.json({
          success: true,
          message: 'Admin login successful',
          user: { id: user.id, username: user.username, email: user.email, role: user.role },
          permissions: { ...getRolePermissions('admin'), isAdmin: true, isUser: false },
        });
        response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
        return response;
      }
      return NextResponse.json({ error: 'Invalid Admin Credentials' }, { status: 401 });
    }

    await ensureAuthSchema();
    const user = await getUserByUsername(username.trim());
    if (!user || !(await verifyUserPassword(username.trim(), password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      permissions: { ...getRolePermissions(user.role), isAdmin: user.role === 'admin', isUser: user.role === 'user' },
    });
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;

  } catch (error: any) {
    console.error('Login Route Fatal Error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error.message },
      { status: 500 }
    );
  }
}