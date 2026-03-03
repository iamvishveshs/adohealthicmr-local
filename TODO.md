# Cloudinary Integration TODO

## Phase 1: Setup Cloudinary
- [x] Install cloudinary package
- [x] Create src/lib/cloudinary.ts configuration
- [x] Add Cloudinary environment variables to vercel-env-template.txt

## Phase 2: Video Storage with Cloudinary
- [ ] Create src/app/api/upload-video/route.ts for Cloudinary video uploads
- [ ] Update src/app/utils/videoStorage.ts to use Cloudinary URLs
- [ ] Update src/app/api/videos/route.ts to return Cloudinary URLs

## Phase 3: Answer Attachments with Cloudinary
- [ ] Create src/app/api/upload-answer-attachment/route.ts for image uploads
- [ ] Update src/app/api/answers/route.ts to support attachment URLs

## Phase 4: User Profile Pictures with Cloudinary
- [ ] Create src/app/api/upload-avatar/route.ts for profile picture uploads
- [ ] Update user registration to support avatar URL
- [ ] Update src/app/api/auth/register/route.ts

## Phase 5: Environment Variables
- [ ] Update vercel-env-template.txt with Cloudinary credentials
- [ ] Create .env.local.example for local development
