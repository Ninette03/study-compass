import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} from '../../utils/errors';

describe('Custom Error Classes — Unit Tests', () => {

  test('TC-ERR-01: ValidationError has status 400', () => {
    const err = new ValidationError('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.isOperational).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });

  test('TC-ERR-02: AuthenticationError has status 401', () => {
    const err = new AuthenticationError('Not authenticated');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Not authenticated');
  });

  test('TC-ERR-03: AuthenticationError uses default message when none provided', () => {
    const err = new AuthenticationError();
    expect(err.message).toBe('Authentication failed');
  });

  test('TC-ERR-04: AuthorizationError has status 403', () => {
    const err = new AuthorizationError('Access denied');
    expect(err.statusCode).toBe(403);
  });

  test('TC-ERR-05: AuthorizationError uses default message when none provided', () => {
    const err = new AuthorizationError();
    expect(err.message).toBe('Access denied');
  });

  test('TC-ERR-06: NotFoundError has status 404', () => {
    const err = new NotFoundError('Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });

  test('TC-ERR-07: ConflictError has status 409', () => {
    const err = new ConflictError('Email already registered');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email already registered');
  });

  test('TC-ERR-08: All errors are instances of Error', () => {
    expect(new ValidationError('x') instanceof Error).toBe(true);
    expect(new AuthenticationError('x') instanceof Error).toBe(true);
    expect(new NotFoundError('x') instanceof Error).toBe(true);
  });

  test('TC-ERR-09: isOperational flag defaults to true', () => {
    const err = new AppError(500, 'Internal');
    expect(err.isOperational).toBe(true);
  });

  test('TC-ERR-10: AppError accepts custom statusCode', () => {
    const err = new AppError(503, 'Service unavailable');
    expect(err.statusCode).toBe(503);
  });

});
