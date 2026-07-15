import axios from 'axios';
import { config } from '../config/env';

export interface SentimentResult {
  label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
}

export class SentimentClassifier {
  private apiKey: string;
  private modelUrl: string;
  private threshold: number;

  constructor() {
    this.apiKey = config.huggingface.apiKey;
    this.modelUrl = config.huggingface.modelUrl;
    this.threshold = config.huggingface.sentimentNegativeThreshold;
  }

  async classify(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      return { label: 'NEUTRAL', confidence: 0 };
    }

    if (!this.apiKey || !this.modelUrl) {
      // No API key configured — skip classification, worker will not update status
      throw new Error('HuggingFace API key or model URL is not configured');
    }

    const response = await axios.post(
      this.modelUrl,
      { inputs: text, options: { wait_for_model: true } },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 60000,
      }
    );
    if (!Array.isArray(response.data) || !Array.isArray(response.data[0])) {
      throw new Error(`Unexpected HuggingFace response: ${JSON.stringify(response.data)}`);
    }

    const results = response.data[0];
    const bestResult = results.reduce((prev: any, current: any) =>
      prev.score > current.score ? prev : current
    );

    const labelMap: { [key: string]: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' } = {
      'LABEL_0': 'NEGATIVE',
      'LABEL_1': 'NEUTRAL',
      'LABEL_2': 'POSITIVE',
      'POSITIVE': 'POSITIVE',
      'NEGATIVE': 'NEGATIVE',
      'NEUTRAL': 'NEUTRAL',
    };

    const rawLabel = bestResult.label.toUpperCase();
    const label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = labelMap[rawLabel] || 'NEUTRAL';

    return { label, confidence: bestResult.score };
  }

  shouldAutoFlag(label: string, confidence: number): boolean {
    return label === 'NEGATIVE' && confidence >= this.threshold;
  }
}

export const sentimentClassifier = new SentimentClassifier();
