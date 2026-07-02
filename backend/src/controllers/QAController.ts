import { Request, Response, NextFunction } from 'express';
import { FlagReason, Sentiment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { sentimentQueue } from '../lib/sentimentQueue';
import { notificationService } from '../services/NotificationService';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';

export class QAController {
  /**
   * Create a new question
   */
  async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { title, body, institutionId, programme, tags } = req.body as {
        title: string;
        body?: string;
        institutionId: string;
        programme?: string;
        tags?: string[];
      };

      if (!title || !institutionId) {
        throw new ValidationError('Title and institution are required');
      }

      // Verify institution exists
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
      });

      if (!institution) {
        throw new NotFoundError('Institution not found');
      }

      // Upsert tags by name so the frontend can send either names or IDs
      let tagConnections: { id: string }[] = [];
      if (tags && tags.length > 0) {
        const upserted = await Promise.all(
          tags.map((nameOrId: string) =>
            prisma.tag.upsert({
              where: { name: nameOrId },
              update: {},
              create: { id: uuidv4(), name: nameOrId },
            })
          )
        );
        tagConnections = upserted.map(t => ({ id: t.id }));
      }

      // Create question
      const question = await prisma.question.create({
        data: {
          id: uuidv4(),
          userId: req.user.userId,
          title,
          body: body || '',
          institutionId,
          programme: programme || null,
          tags: {
            connect: tagConnections,
          },
        },
        include: {
          tags: true,
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      // Notify matched advisors
      await notificationService.notifyMatchedAdvisors(
        question.id,
        question.title,
        question.tags.map((tag: { id: string }) => tag.id)
      );

      res.status(201).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all questions (with optional filtering)
   */
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { institutionId, title, userId, skip = 0, take = 20 } = req.query;

      const where: any = {};
      if (institutionId) where.institutionId = institutionId;
      if (title) where.title = { contains: title, mode: 'insensitive' };
      if (userId) where.userId = userId;

      const questions = await prisma.question.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true } },
          institution: true,
          tags: true,
          responses: {
            select: {
              id: true,
              sentiment: true,
              upvoteCount: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.question.count({ where });

      res.status(200).json({
        success: true,
        data: {
          questions,
          total,
          page: Math.floor(parseInt(String(skip)) / parseInt(String(take))),
          pageSize: parseInt(String(take)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single question with all responses
   */
  async getQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { sentimentFilter } = req.query;

      const sentimentValue = sentimentFilter
        ? (String(sentimentFilter).toUpperCase() as Sentiment)
        : undefined;

      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          institution: true,
          tags: true,
          responses: {
            where: sentimentValue ? { sentiment: sentimentValue } : undefined,
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  profilePhoto: true,
                  advisorProfile: {
                    select: {
                      isVerified: true,
                      programme: true,
                      yearOfEntry: true,
                      yearOfGraduation: true,
                      credibilityScore: true,
                    },
                  },
                },
              },
              upvotes: {
                select: { userId: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Increment view count
      await prisma.question.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Post a response to a question
   */
  async createResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const questionId = req.body.questionId || req.params.questionId;
      const { body, yearAttended, programme, whatWorkedWell, whatCouldBeBetter, wouldRecommend } = req.body;

      if (!questionId || !body) {
        throw new ValidationError('Question ID and response body are required');
      }

      // Verify question exists
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { userId: true },
      });

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Create response with pending sentiment
      let response = await prisma.response.create({
        data: {
          id: uuidv4(),
          questionId,
          userId: req.user.userId,
          body,
          yearAttended: yearAttended || null,
          programme: programme || null,
          whatWorkedWell: whatWorkedWell || null,
          whatCouldBeBetter: whatCouldBeBetter || null,
          wouldRecommend: wouldRecommend || null,
          sentiment: 'PENDING',
        },
      });

      // Enqueue sentiment classification (retried automatically on failure)
      sentimentQueue.add('classify' as string & {}, { responseId: response.id, text: body }).catch((err) =>
        console.error('[SentimentQueue] failed to enqueue job:', err)
      );

      // Notify student that new response was posted
      const respondingUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { fullName: true },
      });

      await notificationService.notifyNewResponse(
        questionId,
        question.userId,
        respondingUser?.fullName || 'An advisor'
      );

      // Fetch complete response with user info
      response = await prisma.response.findUnique({
        where: { id: response.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              advisorProfile: {
                select: {
                  isVerified: true,
                  programme: true,
                  yearOfEntry: true,
                  yearOfGraduation: true,
                  credibilityScore: true,
                },
              },
            },
          },
        },
      }) as any;

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upvote a response
   */
  async upvoteResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { responseId } = req.params;

      // Check if response exists
      const response = await prisma.response.findUnique({
        where: { id: responseId },
        select: { userId: true },
      });

      if (!response) {
        throw new NotFoundError('Response not found');
      }

      // Atomically toggle the upvote and sync the counter in a single transaction
      const userId = req.user.userId;
      const { upvoted } = await prisma.$transaction(async (tx) => {
        const existing = await tx.responseUpvote.findUnique({
          where: { responseId_userId: { responseId, userId } },
        });

        if (existing) {
          await tx.responseUpvote.delete({
            where: { responseId_userId: { responseId, userId } },
          });
          await tx.response.update({
            where: { id: responseId },
            data: { upvoteCount: { decrement: 1 } },
          });
          return { upvoted: false };
        } else {
          await tx.responseUpvote.create({
            data: { id: uuidv4(), responseId, userId },
          });
          await tx.response.update({
            where: { id: responseId },
            data: { upvoteCount: { increment: 1 } },
          });
          return { upvoted: true };
        }
      });

      if (upvoted) {
        // Notify outside the transaction — non-critical side effect
        notificationService.notifyResponseUpvoted(responseId, response.userId).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: upvoted ? 'Response upvoted' : 'Upvote removed',
      });
    } catch (error) {
      next(error);
    }
  }

}

export const qaController = new QAController();
