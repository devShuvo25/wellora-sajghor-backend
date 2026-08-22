import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phoneNumber: z.string().optional(),
    avatar: z.string().url().optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus).optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});

const addressValidationSchema = z.object({
  body: z.object({
    label: z.string({ required_error: 'Address label is required (e.g. Home, Work)' }),
    recipient: z.string({ required_error: 'Recipient name is required' }),
    phone: z.string({ required_error: 'Phone number is required' }),
    address: z.string({ required_error: 'Street address is required' }),
    city: z.string({ required_error: 'City is required' }),
    district: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
  updateUserStatusValidationSchema,
  addressValidationSchema,
};