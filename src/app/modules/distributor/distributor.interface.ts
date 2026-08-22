import { PaymentMethod } from '@prisma/client';

export interface IUpdatePayoutDetails {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  region?: string;
}

export interface IWithdrawalRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  accountName?: string;
  notes?: string;
}

export interface IGenerateReferralPayload {
  campaignTag: string;
  productId?: string;
  baseUrl?: string;
}
