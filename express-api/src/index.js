import 'dotenv/config';
import app from './app.js';
import { initializeDb } from './db/init.js';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initializeDb();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/items`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
