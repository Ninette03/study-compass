import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { AppError, ValidationError } from '../utils/errors';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, password, role } = req.body;

      const result = await authService.register({
        fullName,
        email,
        password,
        role,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login({
        email,
        password,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      await authService.resendVerificationEmail(email);

      res.status(200).json({
        success: true,
        message: 'If that email exists and is unverified, a new link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      await authService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ValidationError('Reset token and new password are required');
      }

      await authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
