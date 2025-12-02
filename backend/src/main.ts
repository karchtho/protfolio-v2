import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST, before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

import express from 'express';

import projectRouter from './routes/projects.routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/projects', projectRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
