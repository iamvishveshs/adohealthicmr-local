import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/db';
import { getAllUsers } from '@/lib/pg-auth';
import { getFallbackUsers } from '@/lib/fallback-users';
import { requireAdmin } from '@/backend/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    if (!hasDatabase()) {
      const users = await getFallbackUsers();
      return NextResponse.json({ success: true, users, count: users.length });
    }
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'user' | 'admin' | null;
    const search = searchParams.get('search');
    const opts: { role?: 'user' | 'admin'; search?: string } = {};
    if (role === 'admin' || role === 'user') opts.role = role;
    if (search) opts.search = search;
    const usersList = await getAllUsers(opts);
    const users = usersList.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
    }));
    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
