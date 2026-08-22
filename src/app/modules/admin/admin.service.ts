import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { DistributorTier, OrderStatus, Prisma, Role, TransactionStatus, UserStatus, WalletTransactionType } from '@prisma/client';

const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrdersCount,
    activeOrdersCount,
    deliveredOrders,
    mtdOrders,
    activeDistributorsCount,
    totalCustomersCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
      },
    }),
    prisma.order.findMany({
      where: { status: OrderStatus.DELIVERED },
      select: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        createdAt: { gte: startOfMonth },
      },
      select: { totalAmount: true },
    }),
    prisma.distributorProfile.count({
      where: { user: { status: UserStatus.ACTIVE } },
    }),
    prisma.user.count({
      where: { role: Role.CUSTOMER },
    }),
    prisma.product.findMany({
      where: { stockQuantity: { lte: 20 } },
      select: { id: true, name: true, stockQuantity: true, image: true, brand: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        distributor: { select: { referralCode: true } },
      },
    }),
  ]);

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const mtdRevenue = mtdOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    metrics: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      mtdRevenue: Number(mtdRevenue.toFixed(2)),
      totalOrders: totalOrdersCount,
      activeOrders: activeOrdersCount,
      activeDistributors: activeDistributorsCount,
      totalCustomers: totalCustomersCount,
      lowStockAlertCount: lowStockProducts.length,
    },
    lowStockProducts,
    recentOrders,
  };
};

const getAllDistributors = async (filters: {
  searchTerm?: string;
  tier?: DistributorTier;
  status?: UserStatus;
  page?: number;
  limit?: number;
}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.DistributorProfileWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { referralCode: { contains: filters.searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ],
    });
  }

  if (filters.tier) {
    andConditions.push({ tier: filters.tier });
  }

  if (filters.status) {
    andConditions.push({ user: { status: filters.status } });
  }

  const whereCondition: Prisma.DistributorProfileWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [distributors, total] = await Promise.all([
    prisma.distributorProfile.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { totalSales: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true, status: true, avatar: true },
        },
        _count: {
          select: { distributorOrders: true, subAffiliates: true },
        },
      },
    }),
    prisma.distributorProfile.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: distributors,
  };
};

const updateDistributor = async (
  id: string,
  payload: {
    tier?: DistributorTier;
    commissionRate?: number;
    userStatus?: UserStatus;
  },
) => {
  const distributor = await prisma.distributorProfile.findUnique({
    where: { id },
  });

  if (!distributor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor not found');
  }

  if (payload.userStatus) {
    await prisma.user.update({
      where: { id: distributor.userId },
      data: { status: payload.userStatus },
    });
  }

  const updateData: Prisma.DistributorProfileUpdateInput = {};
  if (payload.tier) updateData.tier = payload.tier;
  if (payload.commissionRate !== undefined) updateData.commissionRate = payload.commissionRate;

  return await prisma.distributorProfile.update({
    where: { id },
    data: updateData,
    include: { user: true },
  });
};

const getAllWalletTransactions = async (filters: {
  status?: TransactionStatus;
  type?: WalletTransactionType;
  distributorId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 15;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.WalletTransactionWhereInput[] = [];

  if (filters.status) andConditions.push({ status: filters.status });
  if (filters.type) andConditions.push({ type: filters.type });
  if (filters.distributorId) andConditions.push({ distributorId: filters.distributorId });

  const whereCondition: Prisma.WalletTransactionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        distributor: {
          include: {
            user: { select: { name: true, email: true, phoneNumber: true } },
          },
        },
      },
    }),
    prisma.walletTransaction.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: transactions,
  };
};

const updateWalletTransactionStatus = async (
  id: string,
  payload: { status: TransactionStatus; notes?: string },
) => {
  const tx = await prisma.walletTransaction.findUnique({
    where: { id },
    include: { distributor: true },
  });

  if (!tx) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  return await prisma.$transaction(async (prismaTx) => {
    // If rejecting a withdrawal, refund balance to distributor
    if (
      payload.status === TransactionStatus.REJECTED &&
      tx.type === WalletTransactionType.WITHDRAWAL_DEBIT &&
      tx.status === TransactionStatus.PENDING
    ) {
      await prismaTx.distributorProfile.update({
        where: { id: tx.distributorId },
        data: {
          availableBalance: { increment: tx.amount },
        },
      });
    }

    const updated = await prismaTx.walletTransaction.update({
      where: { id },
      data: {
        status: payload.status,
        notes: payload.notes || tx.notes,
      },
    });

    return updated;
  });
};

const getSystemSettings = async () => {
  return await prisma.systemSetting.findMany();
};

const updateSystemSetting = async (key: string, value: string, description?: string) => {
  return await prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });
};

export const AdminService = {
  getDashboardStats,
  getAllDistributors,
  updateDistributor,
  getAllWalletTransactions,
  updateWalletTransactionStatus,
  getSystemSettings,
  updateSystemSetting,
};
