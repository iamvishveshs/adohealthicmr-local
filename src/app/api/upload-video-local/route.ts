import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/auth';
import { getVideos } from '@/lib/store';
import * as fs from 'fs';
import * as path from 'path';
import Busboy from 'busboy';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// DISABLE Next.js internal body parser so it doesn't "jam" your RAM
export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'videos');

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    // 1. Prepare Busboy with headers
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });
    const bb = Busboy({ headers });

    return new Promise((resolve, reject) => {
      let moduleId = '';
      let videoType = '';
      let finalFileUrl = '';
      let originalName = '';
      let finalSize = 0;
      let nextId = 0;

      // Capture metadata fields
      bb.on('field', (name, val) => {
        if (name === 'moduleId') moduleId = val;
        if (name === 'videoType') videoType = val;
      });

      // Stream the file directly to your disk
      bb.on('file', (name, fileStream, info) => {
        const { filename, mimeType } = info;
        originalName = filename;

        const mId = parseInt(moduleId, 10);
        const existing = getVideos(mId, videoType);
        nextId = existing.length > 0 ? Math.max(...existing.map((v) => v.videoId)) + 1 : 1;

        const ext = path.extname(filename) || '.mp4';
        const safeName = `${mId}_${videoType}_${nextId}_${Date.now()}${ext}`;
        const saveTo = path.join(UPLOAD_DIR, safeName);
        finalFileUrl = `/uploads/videos/${safeName}`;

        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

        // PIPE: Browser -> Busboy -> Disk (Very fast, low RAM)
        const writeStream = fs.createWriteStream(saveTo);
        fileStream.pipe(writeStream);

        fileStream.on('data', (data) => { finalSize += data.length; });

        writeStream.on('error', (err) => reject(err));
      });

      bb.on('close', () => {
        resolve(NextResponse.json({
          success: true,
          fileUrl: finalFileUrl,
          previewUrl: '/images/video-placeholder.svg',
          fileName: originalName,
          fileSize: finalSize,
          moduleId: parseInt(moduleId),
          videoType,
          videoId: nextId,
        }));
      });

      bb.on('error', (err) => reject(err));

      // START THE FLOW
      if (request.body) {
        const nodeStream = Readable.fromWeb(request.body as any);
        nodeStream.pipe(bb);
      } else {
        reject(new Error("No request body found"));
      }
    });

  } catch (error: any) {
    console.error('Local Upload Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});