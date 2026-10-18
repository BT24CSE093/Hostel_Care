import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import complaintsRoutes from './modules/complaints/complaints.routes';
import hostelsRoutes from './modules/hostels/hostels.routes';
import staffRoutes from './modules/staff/staff.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { getAllCategories } from './modules/hostels/hostels.controller';
import { testConnection } from './config/database';

const app = express();

// ─── Security & Parsing ───────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ──────────────────────────────────────────
// 'dev' format for development; skip logging sensitive data
app.use(morgan('dev'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({
      status: 'ok',
      server: 'running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      server: 'running',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/hostels', hostelsRoutes);
app.get('/api/complaint-categories', getAllCategories);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
