import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Admin routes - all require ADMIN role
 */

/**
 * POST /admin/institutions
 * Create a new institution (admin only)
 */
router.post('/institutions', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.createInstitution(req, res, next)
);

/**
 * GET /admin/institutions
 * Get all institutions
 */
router.get('/institutions', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.getInstitutions(req, res, next)
);

/**
 * POST /admin/tags
 * Create a new tag (admin only)
 */
router.post('/tags', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.createTag(req, res, next)
);

/**
 * GET /admin/tags
 * Get all tags
 */
router.get('/tags', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.getTags(req, res, next)
);

/**
 * GET /admin/stats
 * Get dashboard statistics (admin only)
 */
router.get('/stats', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.getDashboardStats(req, res, next)
);

/**
 * GET /admin/users
 * Get all users with filtering (admin only)
 */
router.get('/users', authenticate, authorize('ADMIN'), (req, res, next) =>
  adminController.getUsers(req, res, next)
);

export default router;
