import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';
import { ValidationError, NotFoundError } from '../utils/errors';

export class NotificationController {
  /**
   * Get unread notifications for the user
   */
  async getUnreadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const notifications = await notificationService.getUnreadNotifications(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount: notifications.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { notificationId } = req.params;

      await notificationService.markAsRead(notificationId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      await notificationService.markAllAsRead(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
