import { Router } from 'express';
import * as ctrl from '../controllers/videoController.js';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB limit
router.get('/', ctrl.list);
router.post('/', ctrl.create);
// server-side upload to Cloudinary (authenticated)
router.post('/upload', requireAuth, upload.single('file'), ctrl.upload);
router.delete('/:moduleId/:videoType/:videoId', ctrl.remove);
export default router;
