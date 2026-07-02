import { Request, Response, NextFunction } from 'express';
import { FlagReason } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';

export class ModerationController {
  /**
   * Flag a response
   */
  async flagResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { responseId, reason, description } = req.body;

      if (!responseId || !reason) {
        throw new ValidationError('Response ID and reason are required');
      }

      // Verify response exists
      const response = await prisma.response.findUnique({
        where: { id: responseId },
      });

      if (!response) {
        throw new NotFoundError('Response not found');
      }

      // Check if user already flagged this response
      const existingFlag = await prisma.flag.findUnique({
        where: {
          responseId_userId: {
            responseId,
            userId: req.user.userId,
          },
        },
      });

      if (existingFlag) {
        throw new ValidationError('You have already flagged this response');
      }

      // Create flag
      const flag = await prisma.flag.create({
        data: {
          id: uuidv4(),
          responseId,
          userId: req.user.userId,
          reason: reason as FlagReason,
          description: description || null,
        },
      });

      // Update flag count
      const flagCount = await prisma.flag.count({
        where: { responseId },
      });

      await prisma.response.update({
        where: { id: responseId },
        data: { flagCount },
      });

      // If 3+ flags, automatically de-rank the response
      if (flagCount >= 3) {
        console.log(`Response ${responseId} reached 3 flags, moving to bottom`);
      }

      res.status(201).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all flags (admin only)
   */
  async getAllFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { resolved, skip = 0, take = 20 } = req.query;

      const where: any = {};
      if (resolved !== undefined) {
        where.isResolved = resolved === 'true';
      }

      const flags = await prisma.flag.findMany({
        where,
        include: {
          response: {
            select: {
              id: true,
              body: true,
              sentiment: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.flag.count({ where });

      res.status(200).json({
        success: true,
        data: {
          flags,
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
   * Hide a response (admin only)
   */
  async hideResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { responseId } = req.params;
      const { reason } = req.body;

      const response = await prisma.response.findUnique({
        where: { id: responseId },
      });

      if (!response) {
        throw new NotFoundError('Response not found');
      }

      await prisma.response.update({
        where: { id: responseId },
        data: { isHidden: true },
      });

      res.status(200).json({
        success: true,
        message: 'Response hidden',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unhide a response (admin only)
   */
  async unhideResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { responseId } = req.params;

      const response = await prisma.response.findUnique({
        where: { id: responseId },
      });

      if (!response) {
        throw new NotFoundError('Response not found');
      }

      await prisma.response.update({
        where: { id: responseId },
        data: { isHidden: false },
      });

      res.status(200).json({
        success: true,
        message: 'Response unhidden',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve a flag (admin only)
   */
  async resolveFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { flagId } = req.params;
      const { resolutionNotes } = req.body;

      const flag = await prisma.flag.findUnique({
        where: { id: flagId },
      });

      if (!flag) {
        throw new NotFoundError('Flag not found');
      }

      await prisma.flag.update({
        where: { id: flagId },
        data: {
          isResolved: true,
          resolvedBy: req.user.userId,
          resolvedAt: new Date(),
          resolutionNotes: resolutionNotes || null,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Flag resolved',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const moderationController = new ModerationController();
