import express from 'express';
import request from 'supertest';
import cors from 'cors';
import 'express-async-errors';
import { generateToken } from '../../utils/jwt';

// ─── Mock all external dependencies ──────────────────────────────────────────

jest.mock('../../config/env', () => ({
  config: {
    jwt: { secret: 'test-secret', expiresIn: '7d' },
    email: { smtp: { host: '', port: 587, user: '', password: '' } },
    frontend: { url: 'http://localhost:5173' },
    server: { port: 5000, env: 'test' },
    database: { url: '' },
    redis: { url: '' },
    huggingface: { apiKey: 'key', modelUrl: 'http://model', sentimentNegativeThreshold: 0.85 },
  },
}));

const mockPrisma = {
  institution: { findUnique: jest.fn() },
  tag: { upsert: jest.fn() },
  question: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  response: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  responseUpvote: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  flag: {
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  advisorProfile: { findMany: jest.fn() },
  notification: {
    createMany: jest.fn(),
    create: jest.fn(),
  },
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('../../lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('../../lib/sentimentQueue', () => ({
  sentimentQueue: { add: jest.fn().mockResolvedValue(undefined) },
  createSentimentWorker: jest.fn(),
}));
jest.mock('../../services/EmailService', () => ({
  emailService: {
    sendMatchedQuestionEmail: jest.fn().mockResolvedValue(undefined),
    sendNewResponseEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import questionsRoutes from '../../routes/questions';
import moderationRoutes from '../../routes/moderation';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/questions', questionsRoutes);
  app.use('/moderation', moderationRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ─── Test helpers ─────────────────────────────────────────────────────────────

const studentToken = generateToken({ userId: 'student-1', email: 'student@test.com', role: 'STUDENT' });
const advisorToken = generateToken({ userId: 'advisor-1', email: 'advisor@test.com', role: 'ADVISOR' });
const adminToken   = generateToken({ userId: 'admin-1',   email: 'admin@test.com',   role: 'ADMIN' });

const mockInstitution = { id: 'inst-1', name: 'University of Rwanda', country: 'Rwanda' };
const mockTag = { id: 'tag-1', name: 'Computer Science' };
const mockQuestion = {
  id: 'q-1',
  title: 'What is the CS programme like?',
  body: 'Looking for details about the curriculum.',
  institutionId: 'inst-1',
  userId: 'student-1',
  tags: [mockTag],
  user: { id: 'student-1', fullName: 'Alice', email: 'alice@test.com' },
};
const mockResponse = {
  id: 'resp-1',
  questionId: 'q-1',
  userId: 'advisor-1',
  body: 'The programme is excellent with supportive lecturers.',
  sentiment: 'PENDING',
  upvoteCount: 0,
  flagCount: 0,
  isHidden: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Integration Tests — Q&A Flow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.advisorProfile.findMany.mockResolvedValue([]);
    mockPrisma.notification.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.notification.create.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue({ fullName: 'Bob Advisor' });
  });

  // ─── Question creation → notification dispatch ─────────────────────────────

  describe('TC-INT-01 to TC-INT-05: Question creation and notification', () => {

    test('TC-INT-01: POST /questions creates question and returns 201', async () => {
      mockPrisma.institution.findUnique.mockResolvedValueOnce(mockInstitution);
      mockPrisma.tag.upsert.mockResolvedValueOnce(mockTag);
      mockPrisma.question.create.mockResolvedValueOnce(mockQuestion);

      const res = await request(app)
        .post('/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'What is the CS programme like?',
          body: 'Looking for details about the curriculum.',
          institutionId: 'inst-1',
          tags: ['Computer Science'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('q-1');
    });

    test('TC-INT-02: Creating a question triggers notifyMatchedAdvisors', async () => {
      mockPrisma.institution.findUnique.mockResolvedValueOnce(mockInstitution);
      mockPrisma.tag.upsert.mockResolvedValueOnce(mockTag);
      mockPrisma.question.create.mockResolvedValueOnce(mockQuestion);

      const matchedAdvisor = {
        userId: 'advisor-1',
        user: { email: 'advisor@test.com' },
      };
      mockPrisma.advisorProfile.findMany.mockResolvedValueOnce([matchedAdvisor]);

      await request(app)
        .post('/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Question', institutionId: 'inst-1', tags: ['Computer Science'] });

      expect(mockPrisma.notification.createMany).toHaveBeenCalled();
    });

    test('TC-INT-03: POST /questions without auth returns 401', async () => {
      const res = await request(app)
        .post('/questions')
        .send({ title: 'Question', institutionId: 'inst-1' });

      expect(res.status).toBe(401);
    });

    test('TC-INT-04: POST /questions with non-existent institution returns 404', async () => {
      mockPrisma.institution.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Question', institutionId: 'non-existent' });

      expect(res.status).toBe(404);
    });

    test('TC-INT-05: POST /questions without title returns 400', async () => {
      const res = await request(app)
        .post('/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ institutionId: 'inst-1' });

      expect(res.status).toBe(400);
    });

  });

  // ─── Response submission → sentiment queue ────────────────────────────────

  describe('TC-INT-06 to TC-INT-09: Response submission', () => {

    test('TC-INT-06: POST /questions/:id/responses creates response with PENDING sentiment', async () => {
      mockPrisma.question.findUnique.mockResolvedValueOnce({ userId: 'student-1' });
      mockPrisma.response.create.mockResolvedValueOnce(mockResponse);
      mockPrisma.response.findUnique.mockResolvedValueOnce({
        ...mockResponse,
        user: { id: 'advisor-1', fullName: 'Bob', profilePhoto: null, advisorProfile: null },
      });

      const res = await request(app)
        .post('/questions/q-1/responses')
        .set('Authorization', `Bearer ${advisorToken}`)
        .send({
          body: 'The programme is excellent with supportive lecturers.',
          wouldRecommend: 'yes',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.sentiment).toBe('PENDING');
    });

    test('TC-INT-07: Submitting a response enqueues a sentiment classification job', async () => {
      const { sentimentQueue } = require('../../lib/sentimentQueue');
      mockPrisma.question.findUnique.mockResolvedValueOnce({ userId: 'student-1' });
      mockPrisma.response.create.mockResolvedValueOnce(mockResponse);
      mockPrisma.response.findUnique.mockResolvedValueOnce({
        ...mockResponse,
        user: { id: 'advisor-1', fullName: 'Bob', profilePhoto: null, advisorProfile: null },
      });

      await request(app)
        .post('/questions/q-1/responses')
        .set('Authorization', `Bearer ${advisorToken}`)
        .send({ body: 'Great experience.', wouldRecommend: 'yes' });

      expect(sentimentQueue.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ responseId: 'resp-1', text: 'Great experience.' })
      );
    });

    test('TC-INT-08: Submitting a response notifies the question author', async () => {
      mockPrisma.question.findUnique.mockResolvedValueOnce({ userId: 'student-1' });
      mockPrisma.response.create.mockResolvedValueOnce(mockResponse);
      mockPrisma.response.findUnique.mockResolvedValueOnce({
        ...mockResponse,
        user: { id: 'advisor-1', fullName: 'Bob', profilePhoto: null, advisorProfile: null },
      });

      await request(app)
        .post('/questions/q-1/responses')
        .set('Authorization', `Bearer ${advisorToken}`)
        .send({ body: 'Great experience.', wouldRecommend: 'yes' });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'student-1',
            type: 'NEW_RESPONSE',
          }),
        })
      );
    });

    test('TC-INT-09: Submitting response to non-existent question returns 404', async () => {
      mockPrisma.question.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/questions/fake-id/responses')
        .set('Authorization', `Bearer ${advisorToken}`)
        .send({ body: 'Some response.' });

      expect(res.status).toBe(404);
    });

  });

  // ─── Upvote toggle ────────────────────────────────────────────────────────

  describe('TC-INT-10 to TC-INT-12: Upvote toggle', () => {

    test('TC-INT-10: Upvoting a response returns success', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce({ userId: 'advisor-1' });
      mockPrisma.$transaction.mockImplementationOnce(async (fn: any) => {
        return fn({
          responseUpvote: {
            findUnique: jest.fn().mockResolvedValueOnce(null),
            create: jest.fn().mockResolvedValueOnce({}),
          },
          response: { update: jest.fn().mockResolvedValueOnce({}) },
        });
      });

      const res = await request(app)
        .post('/questions/q-1/responses/resp-1/upvote')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/upvoted/i);
    });

    test('TC-INT-11: Upvoting without auth returns 401', async () => {
      const res = await request(app)
        .post('/questions/q-1/responses/resp-1/upvote');
      expect(res.status).toBe(401);
    });

    test('TC-INT-12: Upvoting non-existent response returns 404', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/questions/q-1/responses/fake-resp/upvote')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

  });

  // ─── Moderation — flagging ────────────────────────────────────────────────

  describe('TC-INT-13 to TC-INT-16: Response flagging', () => {

    test('TC-INT-13: Flagging a response returns 201 with flag data', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce(mockResponse);
      mockPrisma.flag.findUnique.mockResolvedValueOnce(null);
      mockPrisma.flag.create.mockResolvedValueOnce({ id: 'flag-1', reason: 'BIASED' });
      mockPrisma.flag.count.mockResolvedValueOnce(1);
      mockPrisma.response.update.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/moderation/flag')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ responseId: 'resp-1', reason: 'BIASED' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('TC-INT-14: Flagging same response twice returns 400', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce(mockResponse);
      mockPrisma.flag.findUnique.mockResolvedValueOnce({ id: 'flag-existing' });

      const res = await request(app)
        .post('/moderation/flag')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ responseId: 'resp-1', reason: 'BIASED' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/already flagged/i);
    });

    test('TC-INT-15: Flagging without responseId returns 400', async () => {
      const res = await request(app)
        .post('/moderation/flag')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ reason: 'SPAM' });

      expect(res.status).toBe(400);
    });

    test('TC-INT-16: Flagging without auth returns 401', async () => {
      const res = await request(app)
        .post('/moderation/flag')
        .send({ responseId: 'resp-1', reason: 'BIASED' });

      expect(res.status).toBe(401);
    });

  });

  // ─── Moderation — hide / unhide (admin) ───────────────────────────────────

  describe('TC-INT-17 to TC-INT-19: Admin hide/unhide response', () => {

    test('TC-INT-17: Admin can hide a response', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce(mockResponse);
      mockPrisma.response.update.mockResolvedValueOnce({ ...mockResponse, isHidden: true });

      const res = await request(app)
        .post('/moderation/responses/resp-1/hide')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/hidden/i);
    });

    test('TC-INT-18: Non-admin cannot hide a response', async () => {
      const res = await request(app)
        .post('/moderation/responses/resp-1/hide')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    test('TC-INT-19: Admin can unhide a response', async () => {
      mockPrisma.response.findUnique.mockResolvedValueOnce({ ...mockResponse, isHidden: true });
      mockPrisma.response.update.mockResolvedValueOnce({ ...mockResponse, isHidden: false });

      const res = await request(app)
        .post('/moderation/responses/resp-1/unhide')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/unhidden/i);
    });

  });

});
