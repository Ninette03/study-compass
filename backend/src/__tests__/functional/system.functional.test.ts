import express from 'express';
import request from 'supertest';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { generateToken } from '../../utils/jwt';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../config/env', () => ({
  config: {
    jwt: { secret: 'test-secret', expiresIn: '7d' },
    email: { smtp: { host: '', port: 587, user: '', password: '' } },
    frontend: { url: 'http://localhost:5173' },
    server: { port: 5000, env: 'test' },
    database: { url: '' },
    redis: { url: '' },
    huggingface: { apiKey: '', modelUrl: '', sentimentNegativeThreshold: 0.85 },
  },
}));

const mockPrisma = {
  institution: {
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  tag: { findMany: jest.fn(), create: jest.fn(), upsert: jest.fn(), count: jest.fn().mockResolvedValue(0) },
  advisorProfile: { findMany: jest.fn() },
  notification: { createMany: jest.fn(), create: jest.fn() },
  user: { findUnique: jest.fn() },
};

jest.mock('../../lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../../lib/redis', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    scan: jest.fn().mockResolvedValue(['0', []]),
    on: jest.fn(),
    quit: jest.fn(),
  },
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  cacheDel: jest.fn().mockResolvedValue(undefined),
  cacheDelPattern: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../services/EmailService', () => ({
  emailService: {
    sendMatchedQuestionEmail: jest.fn().mockResolvedValue(undefined),
    sendVerificationStatusEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import publicRoutes from '../../routes/public';
import adminRoutes from '../../routes/admin';
import authRoutes from '../../routes/auth';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

const studentToken = generateToken({ userId: 'student-1', email: 'student@test.com', role: 'STUDENT' });
const adminToken   = generateToken({ userId: 'admin-1',   email: 'admin@test.com',   role: 'ADMIN' });

function buildApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
  });

  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);
  app.use('/', publicRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTIONAL AND SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Functional and System Tests', () => {

  beforeEach(() => jest.clearAllMocks());

  // ─── Health check ──────────────────────────────────────────────────────────

  describe('TC-SYS-01 to TC-SYS-02: Health check endpoint', () => {

    test('TC-SYS-01: GET /health returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });

    test('TC-SYS-02: Health check response is JSON', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

  });

  // ─── Public routes — institutions ─────────────────────────────────────────

  describe('TC-SYS-03 to TC-SYS-06: Public institution routes', () => {

    test('TC-SYS-03: GET /institutions returns institution list without auth', async () => {
      mockPrisma.institution.findMany.mockResolvedValueOnce([
        { id: 'inst-1', name: 'University of Rwanda', country: 'Rwanda', _count: { questions: 5, advisors: 10 } },
        { id: 'inst-2', name: 'ALU', country: 'Rwanda', _count: { questions: 3, advisors: 7 } },
      ]);

      const res = await request(app).get('/institutions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.institutions).toHaveLength(2);
    });

    test('TC-SYS-04: GET /institutions/:id returns institution details', async () => {
      mockPrisma.institution.findUnique.mockResolvedValueOnce({
        id: 'inst-1',
        name: 'University of Rwanda',
        country: 'Rwanda',
        _count: { questions: 5, advisors: 10 },
        questions: [],
        advisors: [],
      });

      const res = await request(app).get('/institutions/inst-1');
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('University of Rwanda');
    });

    test('TC-SYS-05: GET /institutions/:id for non-existent institution returns 404', async () => {
      mockPrisma.institution.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get('/institutions/does-not-exist');
      expect(res.status).toBe(404);
    });

    test('TC-SYS-06: GET /tags returns tag list without auth', async () => {
      mockPrisma.tag.findMany.mockResolvedValueOnce([
        { id: 'tag-1', name: 'Computer Science', category: 'academic' },
        { id: 'tag-2', name: 'Scholarships', category: 'finance' },
      ]);

      const res = await request(app).get('/tags');
      expect(res.status).toBe(200);
      expect(res.body.data.tags).toHaveLength(2);
    });

  });

  // ─── Role-based access control ────────────────────────────────────────────

  describe('TC-SYS-07 to TC-SYS-11: Role-based access control', () => {

    test('TC-SYS-07: Admin route accessible with ADMIN token', async () => {
      mockPrisma.institution.findMany.mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/admin/institutions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test('TC-SYS-08: Admin route returns 403 for STUDENT role', async () => {
      const res = await request(app)
        .get('/admin/institutions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    test('TC-SYS-09: Admin route returns 401 without token', async () => {
      const res = await request(app).get('/admin/institutions');
      expect(res.status).toBe(401);
    });

    test('TC-SYS-10: Admin route returns 401 with malformed token', async () => {
      const res = await request(app)
        .get('/admin/institutions')
        .set('Authorization', 'Bearer not.a.real.token');

      expect(res.status).toBe(401);
    });

    test('TC-SYS-11: Admin route returns 401 with expired-format token', async () => {
      const res = await request(app)
        .get('/admin/institutions')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ4IiwiZW1haWwiOiJ4QHguY29tIiwicm9sZSI6IkFETUlOIn0.INVALIDSIGNATURE');

      expect(res.status).toBe(401);
    });

  });

  // ─── 404 and error handler ────────────────────────────────────────────────

  describe('TC-SYS-12 to TC-SYS-14: Error handling and 404', () => {

    test('TC-SYS-12: Unknown route returns 404 with JSON body', async () => {
      const res = await request(app).get('/this-route-does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/not found/i);
    });

    test('TC-SYS-13: Error response always has success: false', async () => {
      const res = await request(app).get('/admin/institutions'); // no token
      expect(res.body.success).toBe(false);
    });

    test('TC-SYS-14: 404 error contains the requested path', async () => {
      const res = await request(app).get('/non-existent-path');
      expect(res.body.error.message).toContain('/non-existent-path');
    });

  });

  // ─── NotificationService matching logic ───────────────────────────────────

  describe('TC-SYS-15 to TC-SYS-17: NotificationService tag matching', () => {

    test('TC-SYS-15: notifyMatchedAdvisors calls createMany for matched advisors', async () => {
      const { NotificationService } = require('../../services/NotificationService');
      const service = new NotificationService();

      mockPrisma.advisorProfile.findMany.mockResolvedValueOnce([
        { userId: 'advisor-1', user: { email: 'advisor1@test.com' } },
      ]);
      mockPrisma.notification.createMany.mockResolvedValueOnce({ count: 1 });

      await service.notifyMatchedAdvisors('q-1', 'What is CS like?', ['tag-1']);

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              userId: 'advisor-1',
              type: 'MATCHED_QUESTION',
              questionId: 'q-1',
            }),
          ]),
        })
      );
    });

    test('TC-SYS-16: notifyMatchedAdvisors does nothing when tagIds is empty', async () => {
      const { NotificationService } = require('../../services/NotificationService');
      const service = new NotificationService();

      await service.notifyMatchedAdvisors('q-1', 'Question', []);

      expect(mockPrisma.advisorProfile.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.notification.createMany).not.toHaveBeenCalled();
    });

    test('TC-SYS-17: notifyMatchedAdvisors does nothing when no advisors matched', async () => {
      const { NotificationService } = require('../../services/NotificationService');
      const service = new NotificationService();

      mockPrisma.advisorProfile.findMany.mockResolvedValueOnce([]);

      await service.notifyMatchedAdvisors('q-1', 'Question', ['tag-1']);

      expect(mockPrisma.notification.createMany).not.toHaveBeenCalled();
    });

  });

  // ─── Admin — institution and tag management ────────────────────────────────

  describe('TC-SYS-18 to TC-SYS-20: Admin management routes', () => {

    test('TC-SYS-18: Admin can create an institution', async () => {
      mockPrisma.institution.create.mockResolvedValueOnce({
        id: 'inst-new',
        name: 'KIST',
        country: 'Rwanda',
        isClaimed: false,
      });

      const res = await request(app)
        .post('/admin/institutions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'KIST', country: 'Rwanda' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('KIST');
    });

    test('TC-SYS-19: Admin can create a tag', async () => {
      mockPrisma.tag.create.mockResolvedValueOnce({
        id: 'tag-new',
        name: 'Admission',
        category: 'academic',
      });

      const res = await request(app)
        .post('/admin/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admission', category: 'academic' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Admission');
    });

    test('TC-SYS-20: Admin can retrieve all tags', async () => {
      mockPrisma.tag.findMany.mockResolvedValueOnce([
        { id: 'tag-1', name: 'Computer Science', category: 'academic' },
      ]);

      const res = await request(app)
        .get('/admin/tags')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toHaveLength(1);
    });

  });

});
