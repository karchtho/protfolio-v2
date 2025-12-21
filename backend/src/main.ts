import dotenv from 'dotenv';
import path from 'path';

import healthRouter from './routes/health.routes';

// Load environment variables FIRST, before any other imports
const envPath = path.resolve(__dirname, '../.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  No .env.local file found at ${envPath}, using environment variables`);
} else console.log(`✅ Environment loaded from ${envPath}`);

// eslint-disable-next-line import/first -- Must load dotenv before other imports
import express from 'express';

// eslint-disable-next-line import/first -- Must load dotenv before other imports
import { testConnection } from './config/database.config';
// eslint-disable-next-line import/first -- Must load dotenv before other imports
import projectRouter from './routes/projects.routes';
// eslint-disable-next-line import/first -- Must load dotenv before other imports
import uploadsRouter from './routes/uploads.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//Serve static files for uploads
//TODO: check if production issue
// app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/projects', projectRouter);
app.use('/api/uploads', uploadsRouter);
// eslint-disable-next-line import/first -- Must load dotenv before other imports
import authRouter from './routes/auth.routes';

app.use('/api/auth', authRouter);

app.use('/', healthRouter);

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
// Test database connection before starting server
testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
  });
