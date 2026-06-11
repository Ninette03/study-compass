import { Router } from 'express';
import { notificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /notifications?unread=true
 * Get unread notifications (protected)
 */
router.get('/', authenticate, (req, res, next) => notificationController.getUnreadNotifications(req, res, next));

/**
 * POST /notifications/:notificationId/read
 * Mark notification as read (protected)
 */
router.post('/:notificationId/read', authenticate, (req, res, next) => notificationController.markAsRead(req, res, next));

/**
 * POST /notifications/read-all
 * Mark all notifications as read (protected)
 */
router.post('/read-all', authenticate, (req, res, next) => notificationController.markAllAsRead(req, res, next));

export default router;
