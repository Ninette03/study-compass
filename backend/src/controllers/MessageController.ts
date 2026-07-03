import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';

export class MessageController {
  /**
   * POST /messages/conversations
   * Start (or retrieve existing) conversation between a student and an advisor
   * on a specific question. Only the question's author (student) may initiate.
   */
  async startConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { questionId, advisorId } = req.body;
      if (!questionId || !advisorId) {
        throw new ValidationError('questionId and advisorId are required');
      }

      // Verify the question exists and belongs to the requesting user
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { userId: true },
      });

      if (!question) throw new NotFoundError('Question not found');
      if (question.userId !== req.user.userId) {
        throw new AuthorizationError('Only the question author can start a conversation');
      }

      // Verify the advisor has responded to this question
      const advisorResponse = await prisma.response.findFirst({
        where: { questionId, userId: advisorId },
        select: { id: true },
      });

      if (!advisorResponse) {
        throw new ValidationError('The advisor must have responded to this question first');
      }

      // Upsert conversation
      const conversation = await prisma.conversation.upsert({
        where: {
          questionId_studentId_advisorId: {
            questionId,
            studentId: req.user.userId,
            advisorId,
          },
        },
        create: {
          questionId,
          studentId: req.user.userId,
          advisorId,
        },
        update: {},
        include: {
          question: { select: { id: true, title: true } },
          student: { select: { id: true, fullName: true, profilePhoto: true } },
          advisor: { select: { id: true, fullName: true, profilePhoto: true } },
          messages: { orderBy: { createdAt: 'asc' }, take: 50 },
        },
      });

      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /messages/conversations
   * List all conversations for the current user (as student or advisor)
   */
  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { studentId: req.user.userId },
            { advisorId: req.user.userId },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          question: { select: { id: true, title: true } },
          student: { select: { id: true, fullName: true, profilePhoto: true } },
          advisor: { select: { id: true, fullName: true, profilePhoto: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // last message preview
          },
        },
      });

      // Attach unread count per conversation
      const withUnread = await Promise.all(
        conversations.map(async (c) => {
          const unread = await prisma.message.count({
            where: {
              conversationId: c.id,
              isRead: false,
              senderId: { not: req.user!.userId },
            },
          });
          return { ...c, unreadCount: unread };
        })
      );

      res.status(200).json({ success: true, data: { conversations: withUnread } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /messages/conversations/:id
   * Get a single conversation with all messages; marks received messages as read
   */
  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const conversation = await prisma.conversation.findUnique({
        where: { id: req.params.id },
        include: {
          question: { select: { id: true, title: true } },
          student: { select: { id: true, fullName: true, profilePhoto: true } },
          advisor: { select: { id: true, fullName: true, profilePhoto: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conversation) throw new NotFoundError('Conversation not found');

      const isParticipant =
        conversation.studentId === req.user.userId ||
        conversation.advisorId === req.user.userId;

      if (!isParticipant) throw new AuthorizationError('Not a participant in this conversation');

      // Mark all messages NOT sent by current user as read
      await prisma.message.updateMany({
        where: {
          conversationId: conversation.id,
          senderId: { not: req.user.userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /messages/conversations/:id/messages
   * Send a message in a conversation
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { body } = req.body;
      if (!body?.trim()) throw new ValidationError('Message body is required');

      const conversation = await prisma.conversation.findUnique({
        where: { id: req.params.id },
        select: { studentId: true, advisorId: true },
      });

      if (!conversation) throw new NotFoundError('Conversation not found');

      const isParticipant =
        conversation.studentId === req.user.userId ||
        conversation.advisorId === req.user.userId;

      if (!isParticipant) throw new AuthorizationError('Not a participant in this conversation');

      const [message] = await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId: req.params.id,
            senderId: req.user.userId,
            body: body.trim(),
          },
          include: {
            sender: { select: { id: true, fullName: true, profilePhoto: true } },
          },
        }),
        prisma.conversation.update({
          where: { id: req.params.id },
          data: { updatedAt: new Date() },
        }),
      ]);

      // Notify the other participant
      const recipientId =
        req.user.userId === conversation.studentId
          ? conversation.advisorId
          : conversation.studentId;

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'PRIVATE_MESSAGE',
          title: 'New private message',
          message: 'You have a new message.',
        },
      });

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /messages/unread-count
   * Total unread messages count for the current user (used by Navbar badge)
   */
  async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const count = await prisma.message.count({
        where: {
          isRead: false,
          senderId: { not: req.user.userId },
          conversation: {
            OR: [
              { studentId: req.user.userId },
              { advisorId: req.user.userId },
            ],
          },
        },
      });

      res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
