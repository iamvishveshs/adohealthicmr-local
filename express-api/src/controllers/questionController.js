import * as questionRepository from '../repositories/questionRepository.js';

export async function list(req, res, next) {
  try {
    const moduleId = req.query.moduleId ? parseInt(req.query.moduleId, 10) : undefined;
    const questions = await questionRepository.findAll(isNaN(moduleId) ? undefined : moduleId);
    return res.json({ success: true, questions });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const moduleId = req.query.moduleId ? parseInt(req.query.moduleId, 10) : undefined;
    if (!moduleId || isNaN(moduleId)) {
      return res.status(400).json({ error: 'moduleId query param required' });
    }
    const q = await questionRepository.findById(id, moduleId);
    if (!q) return res.status(404).json({ success: false, error: 'Question not found' });
    return res.json({ success: true, question: q });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { id, moduleId, question, options, correctAnswer } = req.body;
    if (!id || !moduleId || !question || !options || !Array.isArray(options)) {
      return res.status(400).json({ error: 'All fields (id, moduleId, question, options) are required' });
    }
    if (options.length < 2) {
      return res.status(400).json({ error: 'Question must have at least 2 options' });
    }
    const q = await questionRepository.create({ id, moduleId, question, options, correctAnswer });
    return res.status(201).json({ success: true, message: 'Question created successfully', question: q });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { moduleId, question, options, correctAnswer } = req.body;
    if (!moduleId) return res.status(400).json({ error: 'moduleId required' });
    const q = await questionRepository.update(id, moduleId, { question, options, correctAnswer });
    if (!q) return res.status(404).json({ success: false, error: 'Question not found' });
    return res.json({ success: true, message: 'Question updated successfully', question: q });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const moduleId = req.query.moduleId ? parseInt(req.query.moduleId, 10) : req.body?.moduleId;
    if (!moduleId || isNaN(moduleId)) {
      return res.status(400).json({ error: 'moduleId required' });
    }
    const ok = await questionRepository.remove(id, moduleId);
    if (!ok) return res.status(404).json({ success: false, error: 'Question not found' });
    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
}
