import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/backend/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import Busboy from 'busboy';

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Prioritize the public one if that's what you set in Vercel
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// App Router Segment Config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    // Check if Cloudinary is configured to avoid the "Missing config" error
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
       return NextResponse.json({ error: "Cloudinary configuration missing on server." }, { status: 500 });
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    const busboy = Busboy({ headers });

    // We wrap this in a promise to handle the stream events
    return await new Promise((resolve, reject) => {
      let folder = 'adohealth_videos';

      busboy.on('file', (name, fileStream, info) => {
        const { filename, mimeType } = info;

        if (!mimeType.startsWith('video/')) {
          fileStream.resume();
          return reject(new Error('Invalid file type. Only videos are allowed.'));
        }

        const cldUploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: folder,
            chunk_size: 20000000, // 20MB chunks
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }

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

      busboy.on('error', (err) => {
        console.error("Busboy Error:", err);
        reject(err);
      });

      // Crucial for App Router: request.body can be null
      if (!request.body) {
        return reject(new Error("No request body found."));
      }

      const nodeStream = Readable.fromWeb(request.body as any);
      nodeStream.pipe(busboy);
    });

  } catch (error: any) {
    console.error('Streaming Failure:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
});