import { NextRequest, NextResponse } from 'next/server';
import {
  createModule,
  deleteModule,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createVideo,
  deleteVideo,
} from '@/lib/store';
import { requireAdmin } from '@/backend/lib/auth';
import { isExpressEnabled, proxyToExpress } from '@/lib/express-proxy';

export const dynamic = 'force-dynamic';

export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { operation, resource, data } = body;

    if (isExpressEnabled()) {
      const res = await proxyToExpress('/api/bulk', {
        method: 'POST',
        body: JSON.stringify({ ...body, userId: user.userId }),
      });
      const result = await res.json();
      return NextResponse.json(result, { status: res.status });
    }
    if (!operation || !resource) {
      return NextResponse.json({ error: 'Operation and resource are required' }, { status: 400 });
    }

    let result: Record<string, unknown> = {};
    switch (resource) {
      case 'modules':
        if (operation === 'create' && Array.isArray(data)) {
          const created: unknown[] = [];
          for (const module of data) {
            try {
              created.push(createModule({ id: module.id, title: module.title, description: module.description, color: module.color }));
            } catch {
              // skip duplicate
            }
          }
          result = { created: created.length, modules: created };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const id of data) {
            if (deleteModule(id)) deleted++;
          }
          result = { deleted };
        }
        break;
      case 'questions':
        if (operation === 'create' && Array.isArray(data)) {
          const created: unknown[] = [];
          for (const q of data) {
            try {
              created.push(createQuestion({ id: q.id, moduleId: q.moduleId, question: q.question, options: q.options, correctAnswer: q.correctAnswer }));
            } catch {
              // skip duplicate
            }
          }
          result = { created: created.length, questions: created };
        } else if (operation === 'update' && Array.isArray(data)) {
          let updated = 0;
          for (const q of data) {
            if (updateQuestion(q.id, q.moduleId, { question: q.question, options: q.options, correctAnswer: q.correctAnswer })) updated++;
          }
          result = { updated };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const item of data) {
            if (deleteQuestion(item.id, item.moduleId)) deleted++;
          }
          result = { deleted };
        }
        break;
      case 'videos':
        if (operation === 'create' && Array.isArray(data)) {
          const created: unknown[] = [];
          for (const video of data) {
            created.push(createVideo({
              moduleId: video.moduleId,
              videoType: video.videoType,
              videoId: video.videoId,
              preview: video.preview,
              fileName: video.fileName,
              fileSize: video.fileSize,
              fileUrl: video.fileUrl,
              uploadedBy: user.userId,
            }));
          }
          result = { created: created.length, videos: created };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const item of data) {
            if (deleteVideo(item.moduleId, item.videoType, item.videoId)) deleted++;
          }
          result = { deleted };
        }
        break;
      default:
        return NextResponse.json(
          { error: `Invalid resource: ${resource}. Supported: modules, questions, videos` },
          { status: 400 }
        );
    }
    return NextResponse.json({ success: true, message: `Bulk ${operation} operation completed`, result });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
