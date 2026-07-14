import express, { Express } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { redis } from './lib/redis.js';
import { createSentimentWorker } from './lib/sentimentQueue.js';

import authRoutes from './routes/auth.js';
import questionsRoutes from './routes/questions.js';
import profileRoutes from './routes/profiles.js';
import moderationRoutes from './routes/moderation.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import messageRoutes from './routes/messages.js';

const app: Express = express();

// Trust Railway's reverse proxy so express-rate-limit reads the real client IP
// from X-Forwarded-For instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// CORS — must come before all other middleware so OPTIONS preflight is handled first.
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});


app.use('/auth', authLimiter, authRoutes);
app.use('/questions', writeLimiter, questionsRoutes);
app.use('/profiles', profileRoutes);
app.use('/moderation', moderationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = config.server.port;

// Start background worker for sentiment classification
// Start background worker for sentiment classification
let sentimentWorker: any = null;
try {
  sentimentWorker = createSentimentWorker();
  console.log('[SentimentWorker] started successfully');
} catch (err: any) {
  console.error('[SentimentWorker] failed to start — sentiment classification disabled:', err.message);
}

const server = app.listen(PORT, () => {
  console.log(`
  Environment: ${config.server.env.padEnd(22)},
  Port: ${PORT.toString().padEnd(28)},
  URL: http://localhost:${PORT.toString().padEnd(19)}
  `);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    if (sentimentWorker) {
      await sentimentWorker.close();
    }
    await redis.quit();
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
