import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Log the full error server-side (visible in Railway logs, never sent to client)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  // Send a safe message to the client — never expose stack traces or DB internals
  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
    },
  });
};
