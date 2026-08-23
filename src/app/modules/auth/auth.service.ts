import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import { verifyToken } from '../../utils/verifyToken';
import prisma from '../../utils/prisma';
import { sendPasswordResetEmail, sendVerificationOtpEmail } from '../../utils/email.util';
import { ILoginUser, IRegisterUser } from './auth.interface';
import {DistributorTier,LoyaltyTransactionType, Role, UserStatus } from '@prisma/client/wasm';
import crypto from 'crypto';

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateReferralCode = (name: string) => {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'WELL';
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

// 💡 Development Demo OTP: '123456' (change to random 6 digits in production)
const generateOtp = () => {
  if (process.env.NODE_ENV !== 'production') {
    return '123456'; // Demo fixed OTP for seamless development
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const buildTokens = async (
  userId: string,
  email: string,
  role: Role,
  tx: any,
) => {
  const jwtPayload = { id: userId, email, role };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await tx.refreshToken.create({
    data: { userId, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (payload: IRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  const role = payload.role || Role.CUSTOMER;

  return await prisma.$transaction(async (tx) => {
    // 1. Create User as PENDING (awaiting email verification)
    const user = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: payload.phoneNumber,
        role,
        status: UserStatus.PENDING, // ← starts PENDING until OTP verified
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 2. Create OTP in DB (Default: 123456 in dev mode)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Delete any old OTPs for this email
    await tx.otpVerification.deleteMany({ where: { email: user.email } });

    await tx.otpVerification.create({
      data: { email: user.email, otp, userId: user.id, expiresAt },
    });

    // =========================================================================
    // 📧 RESEND EMAIL SENDING (Commented out for development/unverified domain)
    // Uncomment the lines below once your custom domain is verified on Resend:
    // =========================================================================
    /*
    sendVerificationOtpEmail(user.email, user.name, otp).catch((err) =>
      console.error('OTP email send error:', err),
    );
    */

    console.log(`\n========================================`);
    console.log(`🔐 [DEV MODE] Registration OTP for ${user.email}: ${otp}`);
    console.log(`========================================\n`);

    return {
      message: 'Registration successful! Please verify your account with the OTP (Demo OTP: 123456).',
      email: user.email,
      userId: user.id,
      demoOtp: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
    };
  });
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────

const verifyOtp = async (payload: { email: string; otp: string }) => {
  const email = payload.email.toLowerCase();

  // Find valid OTP record
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      email,
      otp: payload.otp,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Also allow master demo OTP '123456' in non-production environments
  const isDemoValid = process.env.NODE_ENV !== 'production' && payload.otp === '123456';

  if (!otpRecord && !isDemoValid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP. Please use demo OTP: 123456');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Activate user
    const activatedUser = await tx.user.update({
      where: { email },
      data: { emailVerified: true, status: UserStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 2. Delete used OTPs
    await tx.otpVerification.deleteMany({ where: { email } });

    // 3. Setup accounts based on role
    if (activatedUser.role === Role.CUSTOMER) {
      const existingLoyalty = await tx.loyaltyAccount.findUnique({
        where: { userId: activatedUser.id },
      });

      if (!existingLoyalty) {
        await tx.loyaltyAccount.create({
          data: {
            userId: activatedUser.id,
            availablePoints: 20,
            totalEarnedPoints: 20,
            currentTier: 'VIP Bronze',
            nextTierPoints: 600,
            transactions: {
              create: {
                points: 20,
                type: LoyaltyTransactionType.BONUS,
                description: 'Welcome bonus on email verification',
              },
            },
          },
        });
      }
    }

    if (activatedUser.role === Role.DISTRIBUTOR) {
      const existingDistributor = await tx.distributorProfile.findUnique({
        where: { userId: activatedUser.id },
      });

      if (!existingDistributor) {
        let referralCode = generateReferralCode(activatedUser.name);
        while (await tx.distributorProfile.findUnique({ where: { referralCode } })) {
          referralCode = generateReferralCode(activatedUser.name);
        }
        await tx.distributorProfile.create({
          data: {
            userId: activatedUser.id,
            tier: DistributorTier.BRONZE,
            referralCode,
            commissionRate: 0.12,
          },
        });
      }
    }

    // 4. Issue tokens
    const tokens = await buildTokens(activatedUser.id, activatedUser.email, activatedUser.role, tx);

    return {
      message: 'Email verified successfully! Welcome to Wellora.',
      user: activatedUser,
      ...tokens,
    };
  });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

const resendOtp = async (email: string) => {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No account found with this email');
  }

  if (user.emailVerified && user.status === UserStatus.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This account is already verified. Please login.');
  }

  // Generate and save new OTP (Demo: 123456)
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.otpVerification.deleteMany({ where: { email: normalizedEmail } });
  await prisma.otpVerification.create({
    data: { email: normalizedEmail, otp, userId: user.id, expiresAt },
  });

  // =========================================================================
  // 📧 RESEND EMAIL SENDING (Commented out for development/unverified domain)
  // Uncomment the lines below once your custom domain is verified on Resend:
  // =========================================================================
  /*
  sendVerificationOtpEmail(normalizedEmail, user.name, otp).catch((err) =>
    console.error('Resend OTP email error:', err),
  );
  */

  console.log(`\n========================================`);
  console.log(`🔐 [DEV MODE] Resent OTP for ${normalizedEmail}: ${otp}`);
  console.log(`========================================\n`);

  return {
    message: 'A new OTP has been generated (Demo OTP: 123456).',
    demoOtp: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
  };
};

// ─── Login ────────────────────────────────────────────────────────────────────

const login = async (payload: ILoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
    include: { distributorProfile: true, loyaltyAccount: true },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  if (user.status === UserStatus.PENDING || !user.emailVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Please verify your email first. Use OTP: 123456 to verify.',
    );
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account has been suspended. Contact support.');
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const jwtPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt },
  });

  const { password, ...userData } = user;

  return { user: userData, accessToken, refreshToken };
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      addresses: true,
      distributorProfile: {
        include: {
          subAffiliates: {
            include: {
              subDistributor: {
                include: {
                  user: { select: { name: true, email: true, phoneNumber: true } },
                },
              },
            },
          },
        },
      },
      loyaltyAccount: {
        include: {
          transactions: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

const refreshAccessToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt.refresh_secret as Secret);

  const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User no longer authorized');
  }

  const accessToken = generateToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  return { accessToken };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = async (email: string) => {
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No account found with this email');
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.otpVerification.deleteMany({ where: { email: normalizedEmail } });
  await prisma.otpVerification.create({
    data: { email: normalizedEmail, otp, userId: user.id, expiresAt },
  });

  // =========================================================================
  // 📧 RESEND EMAIL SENDING (Commented out for development/unverified domain)
  // Uncomment the lines below once your custom domain is verified on Resend:
  // =========================================================================
  /*
  sendPasswordResetEmail(normalizedEmail, user.name, otp).catch((err) =>
    console.error('Password reset email error:', err),
  );
  */

  console.log(`\n========================================`);
  console.log(`🔐 [DEV MODE] Password reset OTP for ${normalizedEmail}: ${otp}`);
  console.log(`========================================\n`);

  return {
    message: 'Password reset OTP generated (Demo OTP: 123456)',
    demoOtp: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
  };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = async (payload: { email: string; otp: string; newPassword: string }) => {
  const email = payload.email.toLowerCase();

  const otpRecord = await prisma.otpVerification.findFirst({
    where: { email, otp: payload.otp, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  const isDemoValid = process.env.NODE_ENV !== 'production' && payload.otp === '123456';

  if (!otpRecord && !isDemoValid) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP. Use demo OTP: 123456');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds) || 12,
  );

  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
  await prisma.otpVerification.deleteMany({ where: { email } });

  return { message: 'Password reset successfully' };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

const logout = async (token?: string) => {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  return { message: 'Logged out successfully' };
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const AuthServices = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout,
};
