import * as moduleRepository from '../repositories/moduleRepository.js';

export async function list(req, res, next) {
  try {
    const modules = await moduleRepository.findAll();
    return res.json({ success: true, modules });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const mod = await moduleRepository.findById(id);
    if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
    return res.json({ success: true, module: mod });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { id, title, description, color } = req.body;
    if (!id || !title || !description || !color) {
      return res.status(400).json({ error: 'All fields (id, title, description, color) are required' });
    }
    const mod = await moduleRepository.create({ id, title, description, color });
    return res.status(201).json({ success: true, message: 'Module created successfully', module: mod });
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: `Module with ID ${req.body.id} already exists` });
    }
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const mod = await moduleRepository.update(id, req.body);
    if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });
    return res.json({ success: true, message: 'Module updated successfully', module: mod });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const ok = await moduleRepository.remove(id);
    if (!ok) return res.status(404).json({ success: false, error: 'Module not found' });
    return res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    next(error);
  }
}
