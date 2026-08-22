// auth.validation.ts (adding registerUser)

import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    universityId: z.string().min(3).optional(),
    program: z.enum(['BSC', 'MSC', 'BBA', 'MBA', 'OTHERS']),
    departmentId: z.string(),
    email: z.string().email(),
    role: z.enum(['USER', 'ADMIN']),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const loginUser = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }),
  }),
});
const forgotPasswordValidation = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});
const resetPasswordValidation = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
  }),
});
export const authValidation = {
  registerSchema,
  loginUser,
  forgotPasswordValidation,
  resetPasswordValidation,
};
