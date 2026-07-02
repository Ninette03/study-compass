import { User, UserRole } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { generateToken, JWTPayload } from '../utils/jwt';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';
import { emailService } from './EmailService';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<User>;
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate input
    if (!input.email || !input.password || !input.fullName) {
      throw new ValidationError('Full name, email, and password are required');
    }

    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Hash password before entering the transaction
    const hashedPassword = await bcryptjs.hash(input.password, 10);
    const userId = uuidv4();
    const verificationToken = uuidv4();

    // Wrap user + profile creation in a single transaction.
    // The unique constraint on `email` prevents duplicate registrations
    // even under concurrent requests — no separate existence check needed.
    let user: User;
    try {
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            id: userId,
            email: input.email,
            password: hashedPassword,
            fullName: input.fullName,
            role: input.role,
            emailVerificationToken: verificationToken,
          },
        });

        if (input.role === 'STUDENT') {
          await tx.studentProfile.create({
            data: {
              userId: created.id,
              educationLevel: '',
              countryOfResidence: '',
            },
          });
        } else if (input.role === 'ADVISOR') {
          await tx.advisorProfile.create({
            data: {
              userId: created.id,
              programme: '',
              yearOfEntry: new Date().getFullYear(),
              currentStatus: 'current_student',
            },
          });
        }

        return created;
      });
    } catch (err: any) {
      // Prisma unique constraint violation code
      if (err?.code === 'P2002') {
        throw new ConflictError('Email already registered');
      }
      throw err;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Send email verification link
    if (user.emailVerificationToken) {
      emailService.sendVerificationEmail(user.email, user.emailVerificationToken).catch(err =>
        console.error('Failed to send verification email:', err)
      );
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Validate input
    if (!input.email || !input.password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    const resetToken = uuidv4();
    const resetExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetExpiresAt,
      },
    });

    // Send password reset email
    emailService.sendPasswordResetEmail(user.email, resetToken).catch(err =>
      console.error('Failed to send password reset email:', err)
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
  }
}

export const authService = new AuthService();
