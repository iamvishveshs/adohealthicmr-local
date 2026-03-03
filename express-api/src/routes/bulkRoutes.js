import { Router } from 'express';
import * as ctrl from '../controllers/bulkController.js';

const router = Router();
router.post('/', ctrl.bulk);
export default router;
