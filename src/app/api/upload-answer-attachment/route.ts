import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadImage, CloudinaryUploadResult } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// Note: page-level `config` is deprecated for route handlers in newer Next.js versions.
// If you need to set a body size limit or other route segment config, move it to
// a route segment config file as documented by Next.js.

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const moduleId = formData.get('moduleId') as string | null;
    const questionId = formData.get('questionId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const folder = moduleId 
      ? `adohealthicmr/answers/${moduleId}${questionId ? `/${questionId}` : ''}`
      : 'adohealthicmr/answers';
    
    const result: CloudinaryUploadResult = await uploadImage(base64, folder);

    return NextResponse.json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      moduleId: moduleId ? parseInt(moduleId) : null,
      questionId: questionId ? parseInt(questionId) : null,
    });
  } catch (error) {
    console.error('Error uploading attachment to Cloudinary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload attachment', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
});
