import { z } from 'zod';
import { Role } from '@prisma/client';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().optional(),
    role: z.nativeEnum(Role).optional().default(Role.CUSTOMER),
    referredByCode: z.string().optional(),
    region: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bkashNumber: z.string().optional(),
    nagadNumber: z.string().optional(),
  }),
});

const verifyOtpValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be 6 digits'),
  }),
});

const resendOtpValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    otp: z.string({ required_error: 'OTP is required' }).min(4),
    newPassword: z.string({ required_error: 'New password is required' }).min(6),
  }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  verifyOtpValidationSchema,
  resendOtpValidationSchema,
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  refreshTokenValidationSchema,
};
