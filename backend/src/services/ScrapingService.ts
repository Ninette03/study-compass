import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '../lib/prisma';
import { sentimentClassifier } from './SentimentClassifier';

export interface ScrapedOpinion {
  text: string;
  source: string;
  scrapedAt: Date;
}

export class ScrapingService {
  async scrapeInstitutionOpinions(institutionName: string): Promise<ScrapedOpinion[]> {
    const query = `${institutionName} student review experience Rwanda`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StudyCompassBot/1.0; +https://example.com/bot)',
        },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);
      const snippets: ScrapedOpinion[] = [];

      $('.VwiC3b').each((_, element) => {
        const text = $(element).text().replace(/\s+/g, ' ').trim();
        if (!text) {
          return;
        }

        const source = $(element).closest('a')?.attr('href') || 'google-search';
        snippets.push({
          text,
          source,
          scrapedAt: new Date(),
        });
      });

      return snippets;
    } catch (error) {
      console.error(`[ScrapingService] failed to scrape ${institutionName}:`, error);
      return [];
    }
  }
}

export const scrapingService = new ScrapingService();
