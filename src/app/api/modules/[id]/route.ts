import { NextRequest, NextResponse } from 'next/server';
import { getModuleById, updateModule, deleteModule } from '@/lib/store';
import { requireAdmin, getCurrentUser } from '@/backend/lib/auth';
import { isExpressEnabled, proxyToExpress } from '@/lib/express-proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    if (isExpressEnabled()) {
      const res = await proxyToExpress(`/api/modules/${id}`);
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    const moduleId = parseInt(id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }
    const moduleData = await getModuleById(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, module: moduleData });
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    if (isExpressEnabled()) {
      const body = await request.json();
      const res = await proxyToExpress(`/api/modules/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    const moduleId = parseInt(id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }
    const { title, description, color } = await request.json();
    const updatedModule = await updateModule(moduleId, { title, description, color });
    if (!updatedModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule,
    });
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = resolvedParams.id;
    if (isExpressEnabled()) {
      const res = await proxyToExpress(`/api/modules/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
    const moduleId = parseInt(id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }
    const ok = await deleteModule(moduleId);
    if (!ok) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return NextResponse.json(
      { error: 'Failed to delete module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
