import { Router } from 'express';
import * as itemController from '../controllers/itemController.js';
import {
  createItemValidation,
  updateItemValidation,
  getItemValidation,
  listItemsValidation,
  deleteItemValidation,
  handleValidationErrors,
} from '../validators/itemValidator.js';

const router = Router();

router.get('/', listItemsValidation, handleValidationErrors, itemController.listItems);
router.get('/:id', getItemValidation, handleValidationErrors, itemController.getItem);
router.post('/', createItemValidation, handleValidationErrors, itemController.createItem);
router.put('/:id', updateItemValidation, handleValidationErrors, itemController.updateItem);
router.delete('/:id', deleteItemValidation, handleValidationErrors, itemController.deleteItem);

export default router;
