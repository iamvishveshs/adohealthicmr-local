import { body, param, query, validationResult } from 'express-validator';

export const createItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
    .toInt(),
];

export const updateItemValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid item ID').toInt(),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
    .toInt(),
];

export const getItemValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid item ID').toInt(),
];

export const listItemsValidation = [
  query('name').optional().trim().isLength({ max: 255 }),
  query('minQuantity').optional().isInt({ min: 0 }).toInt(),
];

export const deleteItemValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid item ID').toInt(),
];

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
