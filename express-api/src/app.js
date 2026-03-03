import express from 'express';
import itemRoutes from './routes/itemRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import submissionsRoutes from './routes/submissionsRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import bulkRoutes from './routes/bulkRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/items', itemRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use(errorHandler);

export default app;
