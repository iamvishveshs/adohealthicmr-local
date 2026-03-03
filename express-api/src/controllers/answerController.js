import * as answerRepository from '../repositories/answerRepository.js';

export async function list(req, res, next) {
  try {
    const userId = req.query.userId;
    const moduleId = req.query.moduleId ? parseInt(req.query.moduleId, 10) : undefined;
    const answers = await answerRepository.findAll(userId, isNaN(moduleId) ? undefined : moduleId);
    return res.json({ success: true, answers });
  } catch (error) {
    next(error);
  }
}

export async function submit(req, res, next) {
  try {
    const { userId, moduleId, questionId, answer, isCorrect } = req.body;
    if (!userId || !moduleId || !questionId || answer === undefined) {
      return res.status(400).json({ error: 'userId, moduleId, questionId, answer required' });
    }
    const record = await answerRepository.upsert({ userId, moduleId, questionId, answer, isCorrect });
    return res.status(201).json({ success: true, answer: record });
  } catch (error) {
    next(error);
  }
}
