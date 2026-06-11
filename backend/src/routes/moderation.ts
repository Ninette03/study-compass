import { Router } from 'express';
import { moderationController } from '../controllers/ModerationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * POST /moderation/flag
 * Flag a response (protected)
 */
router.post('/flag', authenticate, (req, res, next) => moderationController.flagResponse(req, res, next));

/**
 * GET /moderation/flags
 * Get all flags (admin only)
 */
router.get('/flags', authenticate, authorize('ADMIN'), (req, res, next) => moderationController.getAllFlags(req, res, next));

/**
 * POST /moderation/responses/:responseId/hide
 * Hide a response (admin only)
 */
router.post('/responses/:responseId/hide', authenticate, authorize('ADMIN'), (req, res, next) =>
  moderationController.hideResponse(req, res, next)
);

/**
 * POST /moderation/responses/:responseId/unhide
 * Unhide a response (admin only)
 */
router.post('/responses/:responseId/unhide', authenticate, authorize('ADMIN'), (req, res, next) =>
  moderationController.unhideResponse(req, res, next)
);

/**
 * POST /moderation/flags/:flagId/resolve
 * Resolve a flag (admin only)
 */
router.post('/flags/:flagId/resolve', authenticate, authorize('ADMIN'), (req, res, next) =>
  moderationController.resolveFlag(req, res, next)
);

export default router;
