import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.port === 465,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });
  }

  private get from() {
    return `"StudyCompass" <${config.email.smtp.user}>`;
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    if (!config.frontend.url) {
      console.error('[EmailService] FRONTEND_URL is not set — verification email not sent');
      return;
    }
    const link = `${config.frontend.url}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Verify your StudyCompass account',
      html: `
        <p>Welcome to StudyCompass!</p>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link does not expire.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    if (!config.frontend.url) {
      console.error('[EmailService] FRONTEND_URL is not set — password reset email not sent');
      return;
    }
    const link = `${config.frontend.url}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Reset your StudyCompass password',
      html: `
        <p>We received a request to reset your password.</p>
        <p>Click the link below to choose a new password (valid for 30 minutes):</p>
        <p><a href="${link}">${link}</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });
  }

  async sendNewResponseEmail(to: string, advisorName: string, questionId: string): Promise<void> {
    const link = `${config.frontend.url}/questions/${questionId}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `${advisorName} responded to your question`,
      html: `
        <p><strong>${advisorName}</strong> has posted a response to your question.</p>
        <p><a href="${link}">View the response</a></p>
      `,
    });
  }

  async sendMatchedQuestionEmail(to: string, questionTitle: string, questionId: string): Promise<void> {
    const link = `${config.frontend.url}/questions/${questionId}`;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'A new question matches your expertise',
      html: `
        <p>Someone is asking a question that matches your expertise:</p>
        <p><strong>${questionTitle}</strong></p>
        <p><a href="${link}">View and respond</a></p>
      `,
    });
  }

  async sendVerificationStatusEmail(to: string, isApproved: boolean, rejectionReason?: string): Promise<void> {
    const subject = isApproved
      ? 'Your StudyCompass advisor profile has been verified'
      : 'Your StudyCompass advisor verification was rejected';
    const body = isApproved
      ? '<p>Congratulations! Your advisor profile has been verified. You can now respond to student questions.</p>'
      : `<p>Your advisor verification was not approved.</p><p>Reason: ${rejectionReason || 'Please review your profile and try again.'}</p>`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html: body,
    });
  }
}

export const emailService = new EmailService();
