import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config(); // Load .env variables

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

interface EmailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
  secure?: boolean;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(config?: EmailConfig) {
    const emailConfig: EmailConfig = config || {
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
      secure: false,
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@university.edu.bd',
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: options.html || options.body,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send OTP for registration
   */
  async sendRegistrationOtp(email: string, otp: string): Promise<void> {
    const subject = 'University Registration OTP';
    const body = `Your registration OTP is: ${otp}. It will expire in 5 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; text-align: center;">
        <h2>University Registration</h2>
        <p>Use the following OTP to complete your registration:</p>
        <h1 style="color: #1a73e8;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `;
    await this.sendEmail({ to: email, subject, body, html });
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const subject = 'Password Reset OTP';
    const body = `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; text-align: center;">
        <h2>Password Reset</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="color: #d93025;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;
    await this.sendEmail({ to: email, subject, body, html });
  }

  /**
   * Switch email provider dynamically
   */
  switchEmailProvider(providerConfig: EmailConfig): void {
    this.transporter = nodemailer.createTransport(providerConfig);
  }
}

/**
 * Switch to Gmail provider (for production)
 */
export const switchToGmailProvider = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPass) {
    throw new Error('Gmail credentials are not set in environment variables');
  }

  emailService.switchEmailProvider({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: gmailUser,
      pass: gmailAppPass,
    },
    secure: false,
  });
};

// Singleton instance for easy import
export const emailService = new EmailService();
