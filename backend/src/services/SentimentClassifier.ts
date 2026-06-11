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
      return {
        label: 'NEUTRAL',
        confidence: 0,
      };
    }

    try {
      const response = await axios.post(
        this.modelUrl,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      // HuggingFace returns an array of results for each input
      const results = response.data[0];
      
      // Find the result with highest score
      const bestResult = results.reduce((prev: any, current: any) =>
        prev.score > current.score ? prev : current
      );

      // Normalize label names from HuggingFace format
      const labelMap: { [key: string]: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' } = {
        'LABEL_0': 'NEGATIVE',
        'LABEL_1': 'NEUTRAL',
        'LABEL_2': 'POSITIVE',
        'positive': 'POSITIVE',
        'negative': 'NEGATIVE',
        'neutral': 'NEUTRAL',
      };

      let label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
      const rawLabel = bestResult.label.toUpperCase();
      label = labelMap[rawLabel] || 'NEUTRAL';

      return {
        label,
        confidence: bestResult.score,
      };
    } catch (error) {
      console.error('Error calling HuggingFace API:', error);
      return {
        label: 'NEUTRAL',
        confidence: 0,
      };
    }
  }

  shouldAutoFlag(label: string, confidence: number): boolean {
    return label === 'NEGATIVE' && confidence >= this.threshold;
  }
}

export const sentimentClassifier = new SentimentClassifier();
