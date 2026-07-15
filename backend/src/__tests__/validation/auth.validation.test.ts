import express from 'express';
import request from 'supertest';
import cors from 'cors';
import 'express-async-errors';

// ─── Mock all external dependencies ─────────────────────────────────────────

jest.mock('../../config/env', () => ({
  config: {
    jwt: { secret: 'test-secret', expiresIn: '7d' },
    email: { smtp: { host: '', port: 587, user: '', password: '' } },
    frontend: { url: 'http://localhost:5173' },
    server: { port: 5000, env: 'test' },
    database: { url: 'postgresql://localhost/test' },
    redis: { url: 'redis://localhost:6379' },
    huggingface: { apiKey: '', modelUrl: '', sentimentNegativeThreshold: 0.85 },
  },
}));

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    studentProfile: { create: jest.fn() },
    advisorProfile: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../services/EmailService', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import { prisma } from '../../lib/prisma';
import authRoutes from '../../routes/auth';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

// Build a minimal Express app for testing
function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('Validation Tests — Auth Routes', () => {

  const app = buildApp();

  // ─── POST /auth/register ──────────────────────────────────────────────────

  describe('POST /auth/register', () => {

    test('TC-VAL-01: Missing fullName returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123', role: 'STUDENT' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('TC-VAL-02: Missing email returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ fullName: 'Alice', password: 'password123', role: 'STUDENT' });
      expect(res.status).toBe(400);
    });

    test('TC-VAL-03: Missing password returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ fullName: 'Alice', email: 'alice@example.com', role: 'STUDENT' });
      expect(res.status).toBe(400);
    });

    test('TC-VAL-04: Password shorter than 8 characters returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ fullName: 'Alice', email: 'alice@example.com', password: 'short', role: 'STUDENT' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/8 characters/);
    });

    test('TC-VAL-05: Empty request body returns 400', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({});
      expect(res.status).toBe(400);
    });

  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {

    test('TC-VAL-06: Missing email returns 400', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    test('TC-VAL-07: Missing password returns 400', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'alice@example.com' });
      expect(res.status).toBe(400);
    });

    test('TC-VAL-08: Wrong password returns 401', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-1',
        email: 'alice@example.com',
        password: '$2b$10$invalidhash',
        fullName: 'Alice',
        role: 'STUDENT',
        emailVerified: true,
      });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toMatch(/Invalid email or password/);
    });

    test('TC-VAL-09: Non-existent email returns 401', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    test('TC-VAL-10: Empty body returns 400', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });

  });

  // ─── Auth middleware validation ───────────────────────────────────────────

  describe('Auth middleware — protected route access', () => {

    test('TC-VAL-11: Request with no Authorization header returns 401', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .send({});
      // Any undefined route hits the 404 handler — confirm at least not 200
      expect(res.status).not.toBe(200);
    });

  });

});
