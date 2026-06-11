import express, { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';

import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import questionsRoutes from './routes/questions';
import profileRoutes from './routes/profiles';
import moderationRoutes from './routes/moderation';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';

const app: Express = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});


app.use('/auth', authRoutes);
app.use('/questions', questionsRoutes);
app.use('/profiles', profileRoutes);
app.use('/moderation', moderationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`
  Environment: ${config.server.env.padEnd(22)},
  Port: ${PORT.toString().padEnd(28)},
  URL: http://localhost:${PORT.toString().padEnd(19)}
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
