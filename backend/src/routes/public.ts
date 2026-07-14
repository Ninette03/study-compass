import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { cacheGet, cacheSet } from '../lib/redis';
import { emailService } from '../services/EmailService';

const router = Router();

const TTL = {
  institutionList: 5 * 60,   // 5 min — changes rarely
  institutionPage: 2 * 60,   // 2 min — questions/advisors change more often
  tagList: 10 * 60,          // 10 min — tags almost never change
};

/**
 * GET /institutions
 * Public list of institutions
 */
router.get('/institutions', async (req, res, next) => {
  try {
    const { skip = 0, take = 100 } = req.query;
    const cacheKey = `institutions:list:${skip}:${take}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { name: 'asc' },
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
      include: {
        _count: { select: { questions: true, advisors: true } },
      },
    });

    await cacheSet(cacheKey, { institutions }, TTL.institutionList);

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
    const cacheKey = `institutions:page:${req.params.id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

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

    await cacheSet(cacheKey, institution, TTL.institutionPage);

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
    const cacheKey = `tags:list:${skip}:${take}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
    });

    await cacheSet(cacheKey, { tags }, TTL.tagList);

    res.status(200).json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


