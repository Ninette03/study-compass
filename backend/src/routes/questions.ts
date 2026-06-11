import { Router } from 'express';
import { qaController } from '../controllers/QAController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /questions
 * Create a new question (protected)
 */
router.post('/', authenticate, (req, res, next) => qaController.createQuestion(req, res, next));

/**
 * GET /questions
 * Get all questions (with optional filtering)
 */
router.get('/', optionalAuth, (req, res, next) => qaController.getQuestions(req, res, next));

/**
 * GET /questions/:id
 * Get a single question with responses
 */
router.get('/:id', optionalAuth, (req, res, next) => qaController.getQuestion(req, res, next));

/**
 * POST /questions/:questionId/responses
 * Post a response to a question (protected)
 */
router.post('/:questionId/responses', authenticate, (req, res, next) => {
  req.body.questionId = req.params.questionId;
  qaController.createResponse(req, res, next);
});

/**
 * POST /questions/:questionId/responses/:responseId/upvote
 * Upvote a response (protected)
 */
router.post('/:questionId/responses/:responseId/upvote', authenticate, (req, res, next) => {
  qaController.upvoteResponse(req, res, next);
});

export default router;
