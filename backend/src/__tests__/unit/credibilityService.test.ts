import { prisma } from '../../lib/prisma';
import { CredibilityService } from '../../services/CredibilityService';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    advisorProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    response: {
      findMany: jest.fn(),
    },
  },
}));

describe('CredibilityService', () => {
  const service = new CredibilityService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('recalculates and updates an advisor credibility score using verification, upvotes, and response volume', async () => {
    (prisma.advisorProfile.findUnique as jest.Mock).mockResolvedValueOnce({ isVerified: true });
    (prisma.response.findMany as jest.Mock).mockResolvedValueOnce([{ upvoteCount: 5 }, { upvoteCount: 7 }]);
    (prisma.advisorProfile.update as jest.Mock).mockResolvedValueOnce({
      userId: 'advisor-1',
      credibilityScore: 13.45,
    });

    const score = await service.updateCredibilityScore('advisor-1');

    const expectedScore = Math.min(20, Number((5 + Math.log1p(12) * 3 + Math.min(5, 2 * 0.5)).toFixed(2)));

    expect(score).toBe(expectedScore);
    expect(prisma.advisorProfile.update).toHaveBeenCalledWith({
      where: { userId: 'advisor-1' },
      data: { credibilityScore: expectedScore },
    });
  });
});
