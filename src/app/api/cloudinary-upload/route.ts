import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import Busboy from 'busboy';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// CRITICAL: Disable Next.js default body parser for large files
export const config = {
  api: {
    bodyParser: false,
  },
};

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    const busboy = Busboy({ headers });

    return new Promise((resolve, reject) => {
      let folder = 'adohealth_videos';

      busboy.on('file', (name, fileStream, info) => {
        const { filename, mimeType } = info;

        if (!mimeType.startsWith('video/')) {
          fileStream.resume();
          return reject(new Error('Invalid file type.'));
        }

        // Initialize Cloudinary Stream
        const cldUploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: folder,
            // chunk_size helps Cloudinary handle the massive stream
            chunk_size: 20000000,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(NextResponse.json({
              success: true,
              fileUrl: result?.secure_url,
              previewUrl: result?.secure_url?.replace(/\.[^/.]+$/, ".jpg"),
              videoId: result?.public_id,
              fileName: filename,
              fileSize: result?.bytes,
            }));
          }
        );

        fileStream.pipe(cldUploadStream);
      });

      busboy.on('error', (err) => reject(err));

      // Convert Next.js Web Stream to Node.js Readable Stream
      const nodeStream = Readable.fromWeb(request.body as any);
      nodeStream.pipe(busboy);
    });

  } catch (error: any) {
    console.error('Streaming Failure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});