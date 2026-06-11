import { PrismaClient, User, UserRole } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, JWTPayload } from '../utils/jwt';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';

const prisma = new PrismaClient();

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(input.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        role: input.role,
        emailVerificationToken: uuidv4(),
      },
    });

    // Create role-specific profile
    if (input.role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          educationLevel: '',
          countryOfResidence: '',
        },
      });
    } else if (input.role === 'ADVISOR') {
      await prisma.advisorProfile.create({
        data: {
          userId: user.id,
          programme: '',
          yearOfEntry: new Date().getFullYear(),
          currentStatus: 'current_student',
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // TODO: Send email verification link
    // await emailService.sendVerificationEmail(user.email, user.emailVerificationToken);

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

    // TODO: Send reset email with token
    // await emailService.sendPasswordResetEmail(user.email, resetToken);
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
