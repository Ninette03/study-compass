import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Send notification to matched advisors when a new question is posted
   */
  async notifyMatchedAdvisors(questionId: string, questionTitle: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    try {
      // Find all advisors whose tags overlap with the question's tags
      const matchedAdvisors = await prisma.advisorProfile.findMany({
        where: {
          tags: {
            some: {
              id: {
                in: tagIds,
              },
            },
          },
        },
        select: {
          userId: true,
        },
      });

      if (matchedAdvisors.length === 0) {
        return;
      }

      // Create notifications for each matched advisor
      const notifications = matchedAdvisors.map((advisor: { userId: string }) => ({
        userId: advisor.userId,
        type: 'MATCHED_QUESTION' as NotificationType,
        title: 'New question matching your expertise',
        message: `Someone is asking: "${questionTitle}"`,
        questionId,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      console.error('Error notifying matched advisors:', error);
      // Don't throw - notifications failing shouldn't block question creation
    }
  }

  /**
   * Notify student when a new response is posted to their question
   */
  async notifyNewResponse(
    questionId: string,
    studentId: string,
    advisorName: string
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'NEW_RESPONSE',
          title: 'New response to your question',
          message: `${advisorName} responded to your question`,
          questionId,
        },
      });
    } catch (error) {
      console.error('Error notifying new response:', error);
    }
  }

  /**
   * Notify advisor when their response is upvoted
   */
  async notifyResponseUpvoted(
    responseId: string,
    advisorId: string
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: advisorId,
          type: 'RESPONSE_UPVOTED',
          title: 'Your response was upvoted',
          message: 'Someone found your response helpful',
          responseId,
        },
      });
    } catch (error) {
      console.error('Error notifying response upvote:', error);
    }
  }

  /**
   * Notify advisor when their verification status changes
   */
  async notifyVerificationStatus(
    advisorId: string,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    try {
      const notificationType = isApproved ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED';
      const title = isApproved ? 'Verification approved' : 'Verification rejected';
      const message = isApproved
        ? 'Your profile has been verified by the admin team'
        : `Your verification was rejected: ${rejectionReason || 'Please try again'}`;

      await prisma.notification.create({
        data: {
          userId: advisorId,
          type: notificationType as NotificationType,
          title,
          message,
        },
      });
    } catch (error) {
      console.error('Error notifying verification status:', error);
    }
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
}

export const notificationService = new NotificationService();
