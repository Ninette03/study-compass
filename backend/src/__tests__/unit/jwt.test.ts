import { generateToken, verifyToken, decodeToken } from '../../utils/jwt';

jest.mock('../../config/env', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-for-unit-tests-only',
      expiresIn: '7d',
    },
  },
}));

describe('JWT Utilities — Unit Tests', () => {

  const payload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'STUDENT',
  };

  // ─── generateToken ───────────────────────────────────────────────────────────

  describe('generateToken()', () => {

    test('TC-JWT-01: Returns a non-empty string token', () => {
      const token = generateToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('TC-JWT-02: Token has three dot-separated segments (JWT format)', () => {
      const token = generateToken(payload);
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    test('TC-JWT-03: Different payloads produce different tokens', () => {
      const token1 = generateToken(payload);
      const token2 = generateToken({ ...payload, userId: 'user-456' });
      expect(token1).not.toBe(token2);
    });

  });

  // ─── verifyToken ─────────────────────────────────────────────────────────────

  describe('verifyToken()', () => {

    test('TC-JWT-04: Valid token returns correct payload', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('TC-JWT-05: Tampered token throws an error', () => {
      const token = generateToken(payload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow('Invalid or expired token');
    });

    test('TC-JWT-06: Completely invalid string throws an error', () => {
      expect(() => verifyToken('not.a.token')).toThrow('Invalid or expired token');
    });

    test('TC-JWT-07: Empty string throws an error', () => {
      expect(() => verifyToken('')).toThrow();
    });

  });

  // ─── decodeToken ─────────────────────────────────────────────────────────────

  describe('decodeToken()', () => {

    test('TC-JWT-08: Valid token returns decoded payload without verification', () => {
      const token = generateToken(payload);
      const decoded = decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });

    test('TC-JWT-09: Invalid token returns null', () => {
      const decoded = decodeToken('completely-invalid');
      expect(decoded).toBeNull();
    });

  });

});
