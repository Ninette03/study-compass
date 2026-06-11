import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * Create a new institution (admin only)
   */
  async createInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { name, country, website } = req.body;

      if (!name || !country) {
        throw new ValidationError('Institution name and country are required');
      }

      const institution = await prisma.institution.create({
        data: {
          id: uuidv4(),
          name,
          country,
          website: website || null,
        },
      });

      res.status(201).json({
        success: true,
        data: institution,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all institutions
   */
  async getInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { country, skip = 0, take = 50 } = req.query;

      const where: any = {};
      if (country) where.country = country;

      const institutions = await prisma.institution.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.institution.count({ where });

      res.status(200).json({
        success: true,
        data: {
          institutions,
          total,
          page: Math.floor(parseInt(String(skip)) / parseInt(String(take))),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new tag (admin only)
   */
  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { name, category } = req.body;

      if (!name) {
        throw new ValidationError('Tag name is required');
      }

      const tag = await prisma.tag.create({
        data: {
          id: uuidv4(),
          name,
          category: category || null,
        },
      });

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tags
   */
  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, skip = 0, take = 100 } = req.query;

      const where: any = {};
      if (category) where.category = category;

      const tags = await prisma.tag.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.tag.count({ where });

      res.status(200).json({
        success: true,
        data: {
          tags,
          total,
          page: Math.floor(parseInt(String(skip)) / parseInt(String(take))),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const [
        totalUsers,
        totalQuestions,
        totalResponses,
        pendingVerifications,
        unresolvedFlags,
        negativeResponses,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.question.count(),
        prisma.response.count(),
        prisma.advisorProfile.count({
          where: { verificationToken: { not: null } },
        }),
        prisma.flag.count({
          where: { isResolved: false },
        }),
        prisma.response.count({
          where: { sentiment: 'NEGATIVE' },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalQuestions,
          totalResponses,
          pendingVerifications,
          unresolvedFlags,
          negativeResponses,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with filtering (admin only)
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { role, skip = 0, take = 20 } = req.query;

      const where: any = {};
      if (role) where.role = role;

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.user.count({ where });

      res.status(200).json({
        success: true,
        data: {
          users,
          total,
          page: Math.floor(parseInt(String(skip)) / parseInt(String(take))),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
