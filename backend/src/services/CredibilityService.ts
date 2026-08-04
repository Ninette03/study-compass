import { prisma } from '../lib/prisma';

export class CredibilityService {
  async updateCredibilityScore(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isVerified: true,
        responses: {
          select: {
            upvoteCount: true,
          },
        },
      },
    });

    if (!user) {
      return 0;
    }

    const responses = Array.isArray(user.responses) ? user.responses : [];
    const baseScore = user.isVerified ? 5 : 0;
    const totalUpvotes = responses.reduce((sum, response) => sum + (response.upvoteCount ?? 0), 0);
    const upvoteScore = Math.log1p(totalUpvotes) * 3;
    const responseVolumeScore = Math.min(5, responses.length * 0.5);

    const rawScore = baseScore + upvoteScore + responseVolumeScore;
    const cappedScore = Math.min(20, Number(rawScore.toFixed(2)));

    await prisma.advisorProfile.update({
      where: { userId },
      data: { credibilityScore: cappedScore },
    });

    return cappedScore;
  }
}

export const credibilityService = new CredibilityService();
