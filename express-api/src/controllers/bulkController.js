import * as moduleRepository from '../repositories/moduleRepository.js';
import * as questionRepository from '../repositories/questionRepository.js';
import * as videoRepository from '../repositories/videoRepository.js';

export async function bulk(req, res, next) {
  try {
    const { operation, resource, data } = req.body;
    if (!operation || !resource) {
      return res.status(400).json({ error: 'Operation and resource are required' });
    }
    const userId = req.body.userId || 'admin';
    let result = {};

    switch (resource) {
      case 'modules':
        if (operation === 'create' && Array.isArray(data)) {
          const created = [];
          for (const m of data) {
            try {
              created.push(await moduleRepository.create(m));
            } catch {}
          }
          result = { created: created.length, modules: created };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const id of data) {
            if (await moduleRepository.remove(id)) deleted++;
          }
          result = { deleted };
        }
        break;
      case 'questions':
        if (operation === 'create' && Array.isArray(data)) {
          const created = [];
          for (const q of data) {
            try {
              created.push(await questionRepository.create(q));
            } catch {}
          }
          result = { created: created.length, questions: created };
        } else if (operation === 'update' && Array.isArray(data)) {
          let updated = 0;
          for (const q of data) {
            const r = await questionRepository.update(q.id, q.moduleId, q);
            if (r) updated++;
          }
          result = { updated };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const item of data) {
            if (await questionRepository.remove(item.id, item.moduleId)) deleted++;
          }
          result = { deleted };
        }
        break;
      case 'videos':
        if (operation === 'create' && Array.isArray(data)) {
          const created = [];
          for (const v of data) {
            created.push(await videoRepository.create({ ...v, uploadedBy: v.uploadedBy || userId }));
          }
          result = { created: created.length, videos: created };
        } else if (operation === 'delete' && Array.isArray(data)) {
          let deleted = 0;
          for (const item of data) {
            if (await videoRepository.remove(item.moduleId, item.videoType, item.videoId)) deleted++;
          }
          result = { deleted };
        }
        break;
      default:
        return res.status(400).json({
          error: `Invalid resource: ${resource}. Supported: modules, questions, videos`,
        });
    }

    return res.json({ success: true, message: `Bulk ${operation} operation completed`, result });
  } catch (error) {
    next(error);
  }
}
