import axios from 'axios';
import { SentimentClassifier } from '../../services/SentimentClassifier';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Silence config warnings during tests
jest.mock('../../config/env', () => ({
  config: {
    huggingface: {
      apiKey: 'test-api-key',
      modelUrl: 'https://api-inference.huggingface.co/models/test-model',
      sentimentNegativeThreshold: 0.85,
    },
  },
}));

describe('SentimentClassifier — Unit Tests', () => {

  let classifier: SentimentClassifier;

  beforeEach(() => {
    classifier = new SentimentClassifier();
  });

  // ─── classify() ─────────────────────────────────────────────────────────────

  describe('classify()', () => {

    test('TC-SC-01: Empty string returns NEUTRAL with confidence 0', async () => {
      const result = await classifier.classify('');
      expect(result.label).toBe('NEUTRAL');
      expect(result.confidence).toBe(0);
    });

    test('TC-SC-02: Whitespace-only string returns NEUTRAL with confidence 0', async () => {
      const result = await classifier.classify('   ');
      expect(result.label).toBe('NEUTRAL');
      expect(result.confidence).toBe(0);
    });

    test('TC-SC-03: Positive text classified as POSITIVE using LABEL_2 format', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'LABEL_0', score: 0.02 },
          { label: 'LABEL_1', score: 0.05 },
          { label: 'LABEL_2', score: 0.93 },
        ]],
      });

      const result = await classifier.classify('The programme is excellent and the lecturers are very supportive.');
      expect(result.label).toBe('POSITIVE');
      expect(result.confidence).toBeCloseTo(0.93);
    });

    test('TC-SC-04: Negative text classified as NEGATIVE using LABEL_0 format', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'LABEL_0', score: 0.91 },
          { label: 'LABEL_1', score: 0.06 },
          { label: 'LABEL_2', score: 0.03 },
        ]],
      });

      const result = await classifier.classify('The facilities are terrible and the administration is very unhelpful.');
      expect(result.label).toBe('NEGATIVE');
      expect(result.confidence).toBeCloseTo(0.91);
    });

    test('TC-SC-05: Neutral text classified as NEUTRAL using LABEL_1 format', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'LABEL_0', score: 0.10 },
          { label: 'LABEL_1', score: 0.82 },
          { label: 'LABEL_2', score: 0.08 },
        ]],
      });

      const result = await classifier.classify('The university is located in Kigali.');
      expect(result.label).toBe('NEUTRAL');
      expect(result.confidence).toBeCloseTo(0.82);
    });

    test('TC-SC-06: Plain lowercase label format (positive) is mapped correctly', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'negative', score: 0.05 },
          { label: 'neutral',  score: 0.10 },
          { label: 'positive', score: 0.85 },
        ]],
      });

      const result = await classifier.classify('Great experience overall.');
      expect(result.label).toBe('POSITIVE');
    });

    test('TC-SC-07: Plain lowercase label format (negative) is mapped correctly', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'negative', score: 0.88 },
          { label: 'neutral',  score: 0.08 },
          { label: 'positive', score: 0.04 },
        ]],
      });

      const result = await classifier.classify('Very disappointing experience.');
      expect(result.label).toBe('NEGATIVE');
    });

    test('TC-SC-08: Unknown label defaults to NEUTRAL', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'UNKNOWN_LABEL', score: 0.99 },
        ]],
      });

      const result = await classifier.classify('Some text.');
      expect(result.label).toBe('NEUTRAL');
    });

    test('TC-SC-09: API returns unexpected format throws error', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { error: 'Model is loading' },
      });

      await expect(classifier.classify('Some text.')).rejects.toThrow();
    });

    test('TC-SC-10: API network error propagates as thrown error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND'));

      await expect(classifier.classify('Some text.')).rejects.toThrow('getaddrinfo ENOTFOUND');
    });

    test('TC-SC-11: The highest scoring label wins when multiple are close', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [[
          { label: 'LABEL_0', score: 0.40 },
          { label: 'LABEL_1', score: 0.41 },
          { label: 'LABEL_2', score: 0.19 },
        ]],
      });

      const result = await classifier.classify('Mixed review of the institution.');
      expect(result.label).toBe('NEUTRAL');
      expect(result.confidence).toBeCloseTo(0.41);
    });

  });

  // ─── shouldAutoFlag() ────────────────────────────────────────────────────────

  describe('shouldAutoFlag()', () => {

    test('TC-AF-01: NEGATIVE with confidence above threshold returns true', () => {
      expect(classifier.shouldAutoFlag('NEGATIVE', 0.90)).toBe(true);
    });

    test('TC-AF-02: NEGATIVE with confidence exactly at threshold returns true', () => {
      expect(classifier.shouldAutoFlag('NEGATIVE', 0.85)).toBe(true);
    });

    test('TC-AF-03: NEGATIVE with confidence below threshold returns false', () => {
      expect(classifier.shouldAutoFlag('NEGATIVE', 0.84)).toBe(false);
    });

    test('TC-AF-04: POSITIVE with high confidence returns false', () => {
      expect(classifier.shouldAutoFlag('POSITIVE', 0.99)).toBe(false);
    });

    test('TC-AF-05: NEUTRAL with high confidence returns false', () => {
      expect(classifier.shouldAutoFlag('NEUTRAL', 0.95)).toBe(false);
    });

    test('TC-AF-06: NEGATIVE with zero confidence returns false', () => {
      expect(classifier.shouldAutoFlag('NEGATIVE', 0)).toBe(false);
    });

  });

});
