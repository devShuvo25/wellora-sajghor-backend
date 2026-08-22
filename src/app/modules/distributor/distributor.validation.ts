import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

const updatePayoutDetailsValidationSchema = z.object({
  body: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bkashNumber: z.string().optional(),
    nagadNumber: z.string().optional(),
    region: z.string().optional(),
  }),
});

const withdrawalRequestValidationSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Withdrawal amount is required' }).positive().min(500, 'Minimum withdrawal amount is 500 BDT'),
    paymentMethod: z.nativeEnum(PaymentMethod, { required_error: 'Payout method is required' }),
    accountNumber: z.string({ required_error: 'Account number is required' }).min(8),
    accountName: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const generateReferralValidationSchema = z.object({
  body: z.object({
    campaignTag: z.string({ required_error: 'Campaign tag is required' }).min(2),
    productId: z.string().optional(),
    baseUrl: z.string().url().optional(),
  }),
});

export const DistributorValidation = {
  updatePayoutDetailsValidationSchema,
  withdrawalRequestValidationSchema,
  generateReferralValidationSchema,
};
