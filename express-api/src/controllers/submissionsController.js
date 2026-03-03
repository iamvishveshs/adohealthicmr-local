import * as answerRepository from '../repositories/answerRepository.js';
import * as moduleRepository from '../repositories/moduleRepository.js';

/** Admin: return all user question/answer submissions. */
export async function list(req, res, next) {
  try {
    const answers = await answerRepository.findAll(undefined, undefined);
    const modules = await moduleRepository.findAll();
    const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));
    const submissions = answers.map((a) => ({
      userId: a.userId,
      moduleId: a.moduleId,
      moduleTitle: moduleTitleById.get(a.moduleId) || `Module ${a.moduleId}`,
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect,
      submittedAt: a.submittedAt,
    }));
    return res.json({ success: true, submissions });
  } catch (error) {
    next(error);
  }
}
