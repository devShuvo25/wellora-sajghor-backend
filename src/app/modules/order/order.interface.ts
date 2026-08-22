import { OrderChannel, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface IOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface ICreateCustomerOrder {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  city: string;
  district?: string;
  items: IOrderItemPayload[];
  paymentMethod?: PaymentMethod;
  referralCode?: string;
  pointsToRedeem?: number;
  channel?: OrderChannel;
  notes?: string;
}

export interface ICreateDistributorOrder {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  city: string;
  district?: string;
  items: IOrderItemPayload[];
  paymentMethod?: PaymentMethod;
  channel?: OrderChannel;
  notes?: string;
}

export interface IOrderFilterOptions {
  searchTerm?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  channel?: OrderChannel;
  distributorId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
