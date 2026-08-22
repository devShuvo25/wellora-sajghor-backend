import { Role, UserStatus } from '@prisma/client';

export interface IUpdateProfile {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface IAddressPayload {
  label: string;
  recipient: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

export interface IUserFilterOptions {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
