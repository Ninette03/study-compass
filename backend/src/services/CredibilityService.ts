import { prisma } from '../lib/prisma';

export class CredibilityService {
  async updateCredibilityScore(userId: string): Promise<number> {
    const [profile, responses] = await Promise.all([
      prisma.advisorProfile.findUnique({
        where: { userId },
        select: { isVerified: true },
      }),
      prisma.response.findMany({
        where: { userId },
        select: { upvoteCount: true },
      }),
    ]);

    if (!profile) {
      return 0;
    }

    const baseScore = profile.isVerified ? 5 : 0;
    const totalUpvotes = responses.reduce((sum: number, response: { upvoteCount: number | null }) => sum + (response.upvoteCount ?? 0), 0);
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
