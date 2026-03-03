import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/auth';
import { getVideos } from '@/lib/store';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import Busboy from 'busboy';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large videos

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });
    const bb = Busboy({ headers });

    return await new Promise((resolve, reject) => {
      let moduleId = '';
      let videoType = '';
      let originalName = '';

      bb.on('field', (name, val) => {
        if (name === 'moduleId') moduleId = val;
        if (name === 'videoType') videoType = val;
      });

      bb.on('file', (name, fileStream, info) => {
        const { filename, mimeType } = info;
        originalName = filename;

        if (!mimeType.startsWith('video/')) {
          fileStream.resume();
          return reject(new Error('Only video files are allowed.'));
        }

        // Generate a clean Public ID for Cloudinary based on your logic
        const mId = parseInt(moduleId, 10) || 0;
        const publicId = `${mId}_${videoType}_${Date.now()}`;

        // Create Cloudinary Upload Stream
        const cldUploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'adohealth_videos',
            public_id: publicId,
            chunk_size: 20000000, // 20MB chunks for better stability
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              return reject(error);
            }

            // Return the same JSON structure your frontend expects
            resolve(NextResponse.json({
              success: true,
              fileUrl: result?.secure_url,
              previewUrl: result?.secure_url?.replace(/\.[^/.]+$/, ".jpg"),
              videoId: result?.public_id,
              fileName: originalName,
              fileSize: result?.bytes,
              moduleId: mId,
              videoType: videoType,
            }));
          }
        );

        // Pipe the incoming file stream directly to Cloudinary
        fileStream.pipe(cldUploadStream);
      });

      bb.on('error', (err) => reject(err));

      if (request.body) {
        const nodeStream = Readable.fromWeb(request.body as any);
        nodeStream.pipe(bb);
      } else {
        reject(new Error("No request body found"));
      }
    });

  } catch (error: any) {
    console.error('Cloudinary Upload Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});