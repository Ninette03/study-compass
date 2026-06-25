import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /institutions
 * Public list of institutions
 */
router.get('/institutions', async (req, res, next) => {
  try {
    const { skip = 0, take = 100 } = req.query;

    const institutions = await prisma.institution.findMany({
      orderBy: { name: 'asc' },
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
      include: {
        _count: { select: { questions: true, advisors: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: { institutions },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /institutions/:id
 * Public single institution with recent questions and verified advisors
 */
router.get('/institutions/:id', async (req, res, next) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { questions: true, advisors: true } },
        questions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            tags: true,
            responses: { select: { id: true, sentiment: true } },
            user: { select: { id: true, fullName: true } },
          },
        },
        advisors: {
          where: { isVerified: true },
          take: 10,
          include: {
            user: { select: { id: true, fullName: true, profilePhoto: true } },
          },
        },
      },
    });

    if (!institution) {
      res.status(404).json({ success: false, message: 'Institution not found' });
      return;
    }

    res.status(200).json({ success: true, data: institution });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tags
 * Public list of tags
 */
router.get('/tags', async (req, res, next) => {
  try {
    const { skip = 0, take = 100 } = req.query;

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
    });

    res.status(200).json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
