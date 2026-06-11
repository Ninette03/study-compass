import { Router } from 'express';
import { profileController } from '../controllers/ProfileController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * GET /profiles/student/:userId
 * Get a student profile
 */
router.get('/student/:userId', (req, res, next) => profileController.getStudentProfile(req, res, next));

/**
 * PUT /profiles/student
 * Update current user's student profile (protected)
 */
router.put('/student', authenticate, (req, res, next) => profileController.updateStudentProfile(req, res, next));

/**
 * GET /profiles/advisor/:userId
 * Get an advisor profile
 */
router.get('/advisor/:userId', (req, res, next) => profileController.getAdvisorProfile(req, res, next));

/**
 * PUT /profiles/advisor
 * Update current user's advisor profile (protected)
 */
router.put('/advisor', authenticate, (req, res, next) => profileController.updateAdvisorProfile(req, res, next));

/**
 * POST /profiles/advisor/verify
 * Submit ID verification for advisor (protected)
 */
router.post('/advisor/verify', authenticate, (req, res, next) => profileController.submitVerification(req, res, next));

/**
 * POST /profiles/advisor/:advisorUserId/approve-verification
 * Approve advisor verification (admin only)
 */
router.post(
  '/advisor/:advisorUserId/approve-verification',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => profileController.approveVerification(req, res, next)
);

/**
 * POST /profiles/advisor/:advisorUserId/reject-verification
 * Reject advisor verification (admin only)
 */
router.post(
  '/advisor/:advisorUserId/reject-verification',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => profileController.rejectVerification(req, res, next)
);

/**
 * GET /profiles/verification-queue
 * Get advisor verification queue (admin only)
 */
router.get('/verification-queue', authenticate, authorize('ADMIN'), (req, res, next) =>
  profileController.getVerificationQueue(req, res, next)
);

export default router;
