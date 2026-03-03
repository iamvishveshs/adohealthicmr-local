import { Router } from 'express';
import * as dataController from '../controllers/dataController.js';

const router = Router();

router.get('/load', dataController.loadData);
router.post('/save', dataController.saveData);

export default router;
