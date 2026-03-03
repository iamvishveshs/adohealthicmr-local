import { Router } from 'express';
import * as ctrl from '../controllers/answerController.js';

const router = Router();
router.get('/', ctrl.list);
router.post('/', ctrl.submit);
export default router;
