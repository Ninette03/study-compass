import cron from 'node-cron';
import { prisma } from './prisma';
import { scrapingQueue } from './scrapingQueue';

export function startScrapingScheduler(): void {
  cron.schedule('0 2 * * 0', async () => {
    try {
      const institutions = await prisma.institution.findMany({
        select: { id: true, name: true },
      });

      for (const institution of institutions) {
        if (scrapingQueue) {
          await scrapingQueue.add('scrape-institution', {
            institutionId: institution.id,
            institutionName: institution.name,
          });
        }
      }

      console.log(`[Scheduler] queued ${institutions.length} scraping jobs`);
    } catch (error) {
      console.error('[Scheduler] failed to queue scraping jobs:', error);
    }
  }, {
    timezone: 'UTC',
  });

  console.log('[Scheduler] scraping scheduler started');
}
