import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { notificationService } from '../services/NotificationService';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';

const prisma = new PrismaClient();

export class ProfileController {
  /**
   * Update student profile
   */
  async updateStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { educationLevel, countryOfResidence, tags } = req.body;

      let profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      profile = await prisma.studentProfile.update({
        where: { userId: req.user.userId },
        data: {
          educationLevel: educationLevel || profile.educationLevel,
          countryOfResidence: countryOfResidence || profile.countryOfResidence,
          tags: tags
            ? {
                set: tags.map((tagId: string) => ({ id: tagId })),
              }
            : undefined,
        },
        include: {
          tags: true,
        },
      });

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student profile
   */
  async getStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          tags: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              createdAt: true,
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update advisor profile
   */
  async updateAdvisorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const {
        institutions,
        programme,
        yearOfEntry,
        yearOfGraduation,
        currentStatus,
        tags,
      } = req.body;

      let profile = await prisma.advisorProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!profile) {
        throw new NotFoundError('Advisor profile not found');
      }

      profile = await prisma.advisorProfile.update({
        where: { userId: req.user.userId },
        data: {
          programme: programme || profile.programme,
          yearOfEntry: yearOfEntry || profile.yearOfEntry,
          yearOfGraduation: yearOfGraduation || profile.yearOfGraduation,
          currentStatus: currentStatus || profile.currentStatus,
          institutions: institutions
            ? {
                set: institutions.map((instId: string) => ({ id: instId })),
              }
            : undefined,
          tags: tags
            ? {
                set: tags.map((tagId: string) => ({ id: tagId })),
              }
            : undefined,
        },
        include: {
          institutions: true,
          tags: true,
        },
      });

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get advisor profile
   */
  async getAdvisorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await prisma.advisorProfile.findUnique({
        where: { userId },
        include: {
          institutions: true,
          tags: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              createdAt: true,
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundError('Advisor profile not found');
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit ID verification
   */
  async submitVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ValidationError('Authentication required');

      const { idVerificationUrl } = req.body;

      if (!idVerificationUrl) {
        throw new ValidationError('Verification document URL is required');
      }

      const profile = await prisma.advisorProfile.update({
        where: { userId: req.user.userId },
        data: {
          verificationToken: uuidv4(),
          idVerificationUrl,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Verification submitted for review',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve advisor verification (admin only)
   */
  async approveVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { advisorUserId } = req.params;

      const profile = await prisma.advisorProfile.update({
        where: { userId: advisorUserId },
        data: {
          isVerified: true,
          verificationReviewedBy: req.user.userId,
          verificationReviewedAt: new Date(),
          verificationToken: null,
        },
      });

      // Notify advisor
      await notificationService.notifyVerificationStatus(advisorUserId, true);

      res.status(200).json({
        success: true,
        message: 'Advisor verified',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject advisor verification (admin only)
   */
  async rejectVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { advisorUserId } = req.params;
      const { rejectionReason } = req.body;

      const profile = await prisma.advisorProfile.update({
        where: { userId: advisorUserId },
        data: {
          isVerified: false,
          verificationReviewedBy: req.user.userId,
          verificationReviewedAt: new Date(),
          verificationRejectionReason: rejectionReason || null,
        },
      });

      // Notify advisor
      await notificationService.notifyVerificationStatus(advisorUserId, false, rejectionReason);

      res.status(200).json({
        success: true,
        message: 'Verification rejected',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get advisor verification queue (admin only)
   */
  async getVerificationQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        throw new AuthorizationError('Admin access required');
      }

      const { skip = 0, take = 20 } = req.query;

      const profiles = await prisma.advisorProfile.findMany({
        where: {
          verificationToken: { not: null },
          isVerified: false,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          institutions: true,
        },
        orderBy: { createdAt: 'asc' },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      });

      const total = await prisma.advisorProfile.count({
        where: {
          verificationToken: { not: null },
          isVerified: false,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          profiles,
          total,
          page: Math.floor(parseInt(String(skip)) / parseInt(String(take))),
          pageSize: parseInt(String(take)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
