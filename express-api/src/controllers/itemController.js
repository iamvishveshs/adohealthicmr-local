/**
 * Item controller - handles HTTP requests and responses
 */

import * as itemRepository from '../repositories/itemRepository.js';

export async function listItems(req, res, next) {
  try {
    const filters = {
      name: req.query.name,
      minQuantity: req.query.minQuantity,
    };
    const items = await itemRepository.findAll(filters);
    return res.json({ success: true, data: items, count: items.length });
  } catch (error) {
    next(error);
  }
}

export async function getItem(req, res, next) {
  try {
    const id = req.params.id;
    const item = await itemRepository.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const { name, description, quantity } = req.body;
    const item = await itemRepository.create({ name, description, quantity });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const id = req.params.id;
    const item = await itemRepository.update(id, req.body);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const id = req.params.id;
    const deleted = await itemRepository.remove(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
