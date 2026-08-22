import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Wellora <noreply@resend.dev>'; // change to your domain after DNS verify

/**
 * Send OTP for email verification after registration
 */
export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  otp: string,
): Promise<void> => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; padding: 40px 0;">
      <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #a855f7, #ec4899); padding: 32px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
            WELLORA <span style="font-weight: 300;">সাজঘর</span>
          </h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Your Skincare Partner</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 40px; text-align: center;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
            Welcome to Wellora! Use the verification code below to complete your registration. 
            This code expires in <strong>10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #f3f4f6; border-radius: 10px; padding: 20px 32px; display: inline-block; margin-bottom: 28px;">
            <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Verification Code</p>
            <h2 style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #a855f7; font-family: monospace;">${otp}</h2>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
            If you didn't create a Wellora account, you can safely ignore this email.<br/>
            Do <strong>not</strong> share this code with anyone.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 40px; text-align: center;">
          <p style="color: #d1d5db; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Wellora সাজঘর. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '🔑 Your Wellora Verification Code',
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    // Log but don't throw in development so server doesn't crash if Resend domain not verified
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
};

/**
 * Send OTP for password reset
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  otp: string,
): Promise<void> => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; padding: 40px 0;">
      <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #a855f7, #ec4899); padding: 32px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
            WELLORA <span style="font-weight: 300;">সাজঘর</span>
          </h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Password Reset Request</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 40px; text-align: center;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
            We received a password reset request for your Wellora account. 
            Use the code below to reset your password. This code expires in <strong>10 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #fff7ed; border-radius: 10px; padding: 20px 32px; display: inline-block; margin-bottom: 28px; border: 1px solid #fed7aa;">
            <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Reset Code</p>
            <h2 style="margin: 0; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #ea580c; font-family: monospace;">${otp}</h2>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
            If you didn't request a password reset, please ignore this email.<br/>
            Your password will remain unchanged.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 40px; text-align: center;">
          <p style="color: #d1d5db; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} Wellora সাজঘর. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '🔐 Reset Your Wellora Password',
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
};
