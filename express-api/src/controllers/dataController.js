import * as dataRepository from '../repositories/dataRepository.js';

export async function loadData(req, res, next) {
  try {
    const { modules, questions } = await dataRepository.loadData();
    return res.json({
      modules,
      questions,
      answers: {},
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function saveData(req, res, next) {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }
    await dataRepository.saveData(data);
    return res.json({
      success: true,
      message: 'Data saved successfully',
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
