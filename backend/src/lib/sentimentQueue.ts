import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/env.js';
import { sentimentClassifier } from '../services/SentimentClassifier';
import { prisma } from './prisma';
import { FlagReason } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// BullMQ bundles its own ioredis version, so pass connection options directly
// rather than sharing the ioredis instance used by the rest of the app.
const connectionOptions = { url: config.redis.url };

// ── Job payload ─────────────────────────────────────────────────────────────

export interface SentimentJobData {
  responseId: string;
  text: string;
}

// ── Queue ───────────────────────────────────────────────────────────────────

let sentimentQueue: Queue<SentimentJobData> | null = null;

try {
  sentimentQueue = new Queue<SentimentJobData>('sentiment', {
    connection: connectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
  console.log('[SentimentQueue] initialized successfully');
} catch (err: any) {
  console.error('[SentimentQueue] failed to initialize:', err.message);
}

export { sentimentQueue };

// ── Worker ──────────────────────────────────────────────────────────────────

export function createSentimentWorker(): Worker<SentimentJobData> | null {
  try {
    const worker = new Worker<SentimentJobData>(
      'sentiment',
      async (job: Job<SentimentJobData>) => {
        const { responseId, text } = job.data;
        const result = await sentimentClassifier.classify(text);
        const shouldAutoFlag = sentimentClassifier.shouldAutoFlag(result.label, result.confidence);

        await prisma.response.update({
          where: { id: responseId },
          data: {
            sentiment: result.label,
            sentimentConfidence: result.confidence,
            isAutoFlagged: shouldAutoFlag,
          },
        });
      },
      {
        connection: connectionOptions,
        concurrency: 5,
      }
    );

    worker.on('failed', (job, err) => {
      console.error(`[SentimentWorker] job ${job?.id} failed:`, err.message);
    });

    return worker;
  } catch (err: any) {
    console.error('[SentimentWorker] failed to create worker:', err.message);
    return null;
  }
}