import { NextRequest, NextResponse } from 'next/server';
import { replaceModulesAndQuestions } from '@/lib/store';
import { requireAdmin } from '@/backend/lib/auth';
import { isExpressEnabled, proxyToExpress } from '@/lib/express-proxy';

export const dynamic = 'force-dynamic';

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const data = await request.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    if (isExpressEnabled()) {
      const res = await proxyToExpress('/api/data/save', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      return NextResponse.json(result, { status: res.status });
    }
    const modules = Array.isArray(data.modules) ? data.modules : [];
    const questions: Record<string, Array<{ id: number; question: string; options: string[]; correctAnswer?: number }>> = {};
    if (data.questions && typeof data.questions === 'object') {
      for (const [moduleIdStr, list] of Object.entries(data.questions)) {
        if (Array.isArray(list)) {
          questions[moduleIdStr] = list.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
          }));
        }
      }
    }
    replaceModulesAndQuestions(
      modules.map((m: any) => ({ id: m.id, title: m.title, description: m.description, color: m.color })),
      questions
    );
    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
