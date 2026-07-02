import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * POST /auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));

/**
 * POST /auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', (req, res, next) => authController.resendVerificationEmail(req, res, next));

/**
 * POST /auth/request-password-reset
 * Request password reset link
 */
router.post('/request-password-reset', (req, res, next) => authController.requestPasswordReset(req, res, next));

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

/**
 * GET /auth/me
 * Get current user (protected)
 */
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export default router;
