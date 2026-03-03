import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadImage, CloudinaryUploadResult, getOptimizedImageUrl } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// Note: page-level `config` is deprecated for route handlers in newer Next.js versions.
// If you need to set a body size limit or other route segment config, move it to
// a route segment config file as documented by Next.js.

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;

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

    // Upload to Cloudinary with user-specific folder
    const folder = `adohealthicmr/avatars/${user.userId}`;
    const result: CloudinaryUploadResult = await uploadImage(base64, folder);

    // Get optimized URLs for different sizes
    const avatarUrls = {
      original: result.secure_url,
      thumbnail: getOptimizedImageUrl(result.public_id, 100, 100),
      small: getOptimizedImageUrl(result.public_id, 200, 200),
      medium: getOptimizedImageUrl(result.public_id, 400, 400),
      large: getOptimizedImageUrl(result.public_id, 800, 800),
    };

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: {
        publicId: result.public_id,
        urls: avatarUrls,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error('Error uploading avatar to Cloudinary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload avatar', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
});
