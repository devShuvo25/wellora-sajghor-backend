import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ICreateCustomerOrder, ICreateDistributorOrder, IOrderFilterOptions } from './order.interface';
import { OrderStatus, PaymentStatus, Prisma, WalletTransactionType, TransactionStatus, LoyaltyTransactionType } from '@prisma/client';

const generateOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `WL-${random}`;
};

const createCustomerOrder = async (
  customerId: string | null,
  payload: ICreateCustomerOrder,
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch products & validate stock
    const productIds = payload.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'One or more products in order do not exist');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalPointsEarned = 0;

    const orderItemsData = payload.items.map((item) => {
      const product = productMap.get(item.productId)!;

      if (!product.inStock || product.stockQuantity < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Product "${product.name}" is out of stock or insufficient quantity (Available: ${product.stockQuantity})`,
        );
      }

      const itemTotal = product.price * item.quantity;
      const itemPoints = (product.points || 10) * item.quantity;

      subtotal += itemTotal;
      totalPointsEarned += itemPoints;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        unitPoints: product.points || 10,
        totalPrice: itemTotal,
      };
    });

    // 2. Handle Loyalty Points Redemption (1 point = 1 BDT discount)
    let discountAmount = 0;
    if (payload.pointsToRedeem && payload.pointsToRedeem > 0 && customerId) {
      const loyaltyAccount = await tx.loyaltyAccount.findUnique({
        where: { userId: customerId },
      });

      if (!loyaltyAccount || loyaltyAccount.availablePoints < payload.pointsToRedeem) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Insufficient loyalty points. Available: ${loyaltyAccount?.availablePoints || 0}`,
        );
      }

      discountAmount = Math.min(payload.pointsToRedeem, subtotal);

      // Deduct points
      await tx.loyaltyAccount.update({
        where: { id: loyaltyAccount.id },
        data: {
          availablePoints: { decrement: payload.pointsToRedeem },
        },
      });

      await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: loyaltyAccount.id,
          points: -payload.pointsToRedeem,
          type: LoyaltyTransactionType.REDEEMED_DISCOUNT,
          description: `Redeemed ${payload.pointsToRedeem} points on order`,
        },
      });
    }

    const shippingFee = subtotal >= 3000 ? 0 : 70; // Free delivery over 3000 BDT
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 3. Resolve Distributor if referralCode provided
    let distributorId: string | null = null;
    let commissionAmount = 0;

    if (payload.referralCode) {
      const distributor = await tx.distributorProfile.findUnique({
        where: { referralCode: payload.referralCode.toUpperCase() },
      });

      if (distributor) {
        distributorId = distributor.id;
        const rate = distributor.commissionRate || 0.12;
        commissionAmount = Number((subtotal * rate).toFixed(2));
      }
    }

    // 4. Generate unique orderNumber
    let orderNumber = generateOrderNumber();
    let isNumberExists = await tx.order.findUnique({ where: { orderNumber } });
    while (isNumberExists) {
      orderNumber = generateOrderNumber();
      isNumberExists = await tx.order.findUnique({ where: { orderNumber } });
    }

    // 5. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: customerId || undefined,
        distributorId: distributorId || undefined,
        customerName: payload.customerName,
        phoneNumber: payload.phoneNumber,
        deliveryAddress: payload.deliveryAddress,
        city: payload.city,
        district: payload.district,
        channel: payload.channel || 'WEBSITE',
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        pointsEarned: totalPointsEarned,
        paymentMethod: payload.paymentMethod || 'COD',
        paymentStatus: PaymentStatus.UNPAID,
        status: OrderStatus.PENDING,
        notes: payload.notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true, brand: true },
            },
          },
        },
      },
    });

    // 6. Update Product Stock quantities
    for (const item of payload.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });
    }

    // 7. If distributor attached, create pending commission transaction & update pendingCommissions
    if (distributorId && commissionAmount > 0) {
      await tx.distributorProfile.update({
        where: { id: distributorId },
        data: {
          pendingCommissions: { increment: commissionAmount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          distributorId,
          type: WalletTransactionType.COMMISSION_CREDIT,
          amount: commissionAmount,
          status: TransactionStatus.PENDING,
          referenceOrderNo: orderNumber,
          notes: `Commission for Order #${orderNumber}`,
        },
      });
    }

    return order;
  });
};

const createDistributorOrder = async (
  distributorUserId: string,
  payload: ICreateDistributorOrder,
) => {
  const distributor = await prisma.distributorProfile.findUnique({
    where: { userId: distributorUserId },
  });

  if (!distributor) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have a distributor account');
  }

  return await createCustomerOrder(null, {
    ...payload,
    referralCode: distributor.referralCode,
    channel: payload.channel || 'DIRECT_LINK',
  });
};

const getOrdersByUser = async (userId: string) => {
  return await prisma.order.findMany({
    where: { customerId: userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true, brand: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getOrderById = async (id: string, userId?: string, isAdmin?: boolean) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: {
        select: { id: true, name: true, email: true, phoneNumber: true },
      },
      distributor: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (!isAdmin && userId && order.customerId !== userId && order.distributor?.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to view this order');
  }

  return order;
};

const getAllOrders = async (filters: IOrderFilterOptions) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { orderNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
        { customerName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.paymentStatus) {
    andConditions.push({ paymentStatus: filters.paymentStatus });
  }

  if (filters.channel) {
    andConditions.push({ channel: filters.channel });
  }

  if (filters.distributorId) {
    andConditions.push({ distributorId: filters.distributorId });
  }

  if (filters.startDate || filters.endDate) {
    andConditions.push({
      createdAt: {
        gte: filters.startDate ? new Date(filters.startDate) : undefined,
        lte: filters.endDate ? new Date(filters.endDate) : undefined,
      },
    });
  }

  const whereCondition: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        distributor: {
          select: { referralCode: true, user: { select: { name: true } } },
        },
      },
    }),
    prisma.order.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: orders,
  };
};

const updateOrderStatus = async (
  id: string,
  payload: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingCode?: string;
    courierName?: string;
    notes?: string;
  },
) => {
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: { distributor: true },
  });

  if (!currentOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: payload,
      include: { items: true },
    });

    // If order transitioned to DELIVERED
    if (payload.status === OrderStatus.DELIVERED && currentOrder.status !== OrderStatus.DELIVERED) {
      // 1. Mark payment as PAID if not already
      await tx.order.update({
        where: { id },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      // 2. Award customer loyalty points
      if (currentOrder.customerId && currentOrder.pointsEarned > 0) {
        const loyaltyAccount = await tx.loyaltyAccount.findUnique({
          where: { userId: currentOrder.customerId },
        });

        if (loyaltyAccount) {
          const newTotal = loyaltyAccount.totalEarnedPoints + currentOrder.pointsEarned;
          let currentTier = loyaltyAccount.currentTier;
          if (newTotal >= 2000) currentTier = 'VIP Platinum';
          else if (newTotal >= 1000) currentTier = 'VIP Gold';
          else if (newTotal >= 500) currentTier = 'VIP Silver';

          await tx.loyaltyAccount.update({
            where: { id: loyaltyAccount.id },
            data: {
              availablePoints: { increment: currentOrder.pointsEarned },
              totalEarnedPoints: { increment: currentOrder.pointsEarned },
              currentTier,
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              loyaltyAccountId: loyaltyAccount.id,
              points: currentOrder.pointsEarned,
              type: LoyaltyTransactionType.EARNED_ORDER,
              description: `Earned points from Order #${currentOrder.orderNumber}`,
              referenceOrderId: currentOrder.id,
            },
          });
        }
      }

      // 3. Finalize Distributor Commission
      if (currentOrder.distributorId) {
        const pendingTx = await tx.walletTransaction.findFirst({
          where: {
            referenceOrderNo: currentOrder.orderNumber,
            type: WalletTransactionType.COMMISSION_CREDIT,
            status: TransactionStatus.PENDING,
          },
        });

        if (pendingTx) {
          await tx.walletTransaction.update({
            where: { id: pendingTx.id },
            data: { status: TransactionStatus.COMPLETED },
          });

          await tx.distributorProfile.update({
            where: { id: currentOrder.distributorId },
            data: {
              availableBalance: { increment: pendingTx.amount },
              pendingCommissions: { decrement: pendingTx.amount },
              totalSales: { increment: currentOrder.subtotal },
            },
          });

          // Check parent distributor team override
          const override = await tx.teamOverride.findFirst({
            where: { subDistributorId: currentOrder.distributorId },
          });

          if (override) {
            const overrideBonus = Number((currentOrder.subtotal * (override.overrideRate || 0.03)).toFixed(2));
            if (overrideBonus > 0) {
              await tx.distributorProfile.update({
                where: { id: override.parentDistributorId },
                data: {
                  availableBalance: { increment: overrideBonus },
                },
              });

              await tx.walletTransaction.create({
                data: {
                  distributorId: override.parentDistributorId,
                  type: WalletTransactionType.BONUS_CREDIT,
                  amount: overrideBonus,
                  status: TransactionStatus.COMPLETED,
                  referenceOrderNo: currentOrder.orderNumber,
                  notes: `Team override bonus from distributor order #${currentOrder.orderNumber}`,
                },
              });
            }
          }
        }
      }
    }

    return updatedOrder;
  });
};

export const OrderService = {
  createCustomerOrder,
  createDistributorOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
