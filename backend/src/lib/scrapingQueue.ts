import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/env.js';
import { prisma } from './prisma';
import { scrapingService } from '../services/ScrapingService';
import { sentimentClassifier } from '../services/SentimentClassifier';
import { v4 as uuidv4 } from 'uuid';

const connectionOptions = { url: config.redis.url };

export interface ScrapingJobData {
  institutionId: string;
  institutionName: string;
}

let scrapingQueue: Queue<ScrapingJobData> | null = null;

try {
  scrapingQueue = new Queue<ScrapingJobData>('scraping', {
    connection: connectionOptions,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
  console.log('[ScrapingQueue] initialized successfully');
} catch (err: any) {
  console.error('[ScrapingQueue] failed to initialize:', err.message);
}

export { scrapingQueue };

export function createScrapingWorker(): Worker<ScrapingJobData> | null {
  try {
    const worker = new Worker<ScrapingJobData>(
      'scraping',
      async (job: Job<ScrapingJobData>) => {
        const { institutionId, institutionName } = job.data;
        const opinions = await scrapingService.scrapeInstitutionOpinions(institutionName);

        for (const opinion of opinions) {
          if (opinion.text.length < 30 || opinion.text.length > 1000) {
            continue;
          }

          try {
            const result = await sentimentClassifier.classify(opinion.text);
            await prisma.scrapedSentiment.create({
              data: {
                id: uuidv4(),
                institutionId,
                sourceText: opinion.text,
                sourceUrl: opinion.source,
                sentiment: result.label,
                confidence: result.confidence,
                scrapedAt: opinion.scrapedAt,
              },
            });
          } catch (error) {
            console.error(`[ScrapingWorker] failed to save opinion for ${institutionName}:`, error);
          }
        }
      },
      {
        connection: connectionOptions,
        concurrency: 2,
      }
    );

    worker.on('failed', (job, err) => {
      console.error(`[ScrapingWorker] job ${job?.id} failed:`, err.message);
    });

    return worker;
  } catch (err: any) {
    console.error('[ScrapingWorker] failed to create worker:', err.message);
    return null;
  }
}
