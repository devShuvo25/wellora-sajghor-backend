import { z } from 'zod';
import { OrderChannel, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const orderItemSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z.number({ required_error: 'Quantity is required' }).int().positive(),
});

const createCustomerOrderValidationSchema = z.object({
  body: z.object({
    customerName: z.string({ required_error: 'Customer name is required' }).min(2),
    phoneNumber: z.string({ required_error: 'Phone number is required' }).min(10),
    deliveryAddress: z.string({ required_error: 'Delivery address is required' }).min(5),
    city: z.string({ required_error: 'City is required' }),
    district: z.string().optional(),
    items: z.array(orderItemSchema).nonempty('At least one item is required in order'),
    paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.COD),
    referralCode: z.string().optional(),
    pointsToRedeem: z.number().int().nonnegative().optional(),
    channel: z.nativeEnum(OrderChannel).optional().default(OrderChannel.WEBSITE),
    notes: z.string().optional(),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    trackingCode: z.string().optional(),
    courierName: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const OrderValidation = {
  createCustomerOrderValidationSchema,
  updateOrderStatusValidationSchema,
};
