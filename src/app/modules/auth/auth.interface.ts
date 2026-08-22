import { Role } from '@prisma/client';

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: Role;
  referredByCode?: string; // Optional referral code from another distributor
  region?: string;         // For distributor
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bkashNumber?: string;
  nagadNumber?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IResetPassword {
  email: string;
  otp: string;
  newPassword: string;
}
