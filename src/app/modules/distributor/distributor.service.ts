import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { IGenerateReferralPayload, IUpdatePayoutDetails, IWithdrawalRequest } from './distributor.interface';
import { TransactionStatus, WalletTransactionType } from '@prisma/client';

const getMyProfile = async (userId: string) => {
  const profile = await prisma.distributorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phoneNumber: true, avatar: true },
      },
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  return profile;
};

const updatePayoutDetails = async (userId: string, payload: IUpdatePayoutDetails) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  return await prisma.distributorProfile.update({
    where: { userId },
    data: payload,
  });
};

const getWalletSummary = async (userId: string) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  const transactions = await prisma.walletTransaction.findMany({
    where: { distributorId: profile.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    availableBalance: profile.availableBalance,
    pendingCommissions: profile.pendingCommissions,
    totalSales: profile.totalSales,
    tier: profile.tier,
    commissionRate: profile.commissionRate,
    transactions,
  };
};

const requestWithdrawal = async (userId: string, payload: IWithdrawalRequest) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  if (profile.availableBalance < payload.amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient available balance. You have ৳${profile.availableBalance.toFixed(2)} available.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Deduct available balance
    await tx.distributorProfile.update({
      where: { id: profile.id },
      data: {
        availableBalance: { decrement: payload.amount },
      },
    });

    // Create withdrawal transaction
    const transaction = await tx.walletTransaction.create({
      data: {
        distributorId: profile.id,
        type: WalletTransactionType.WITHDRAWAL_DEBIT,
        amount: payload.amount,
        status: TransactionStatus.PENDING,
        paymentMethod: payload.paymentMethod,
        accountNumber: payload.accountNumber,
        accountName: payload.accountName,
        notes: payload.notes || `Withdrawal request via ${payload.paymentMethod}`,
      },
    });

    return transaction;
  });
};

const getAnalytics = async (userId: string) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  // Get orders attributed to this distributor
  const orders = await prisma.order.findMany({
    where: { distributorId: profile.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, image: true, price: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate monthly stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;

  // Product sales map
  const productSalesMap = new Map<string, { product: any; unitsSold: number; totalRevenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = productSalesMap.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.totalRevenue += item.totalPrice;
      } else {
        productSalesMap.set(item.productId, {
          product: item.product,
          unitsSold: item.quantity,
          totalRevenue: item.totalPrice,
        });
      }
    }
  }

  const topSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  return {
    summary: {
      totalSales: profile.totalSales,
      availableBalance: profile.availableBalance,
      pendingCommissions: profile.pendingCommissions,
      totalOrders,
      deliveredOrders,
      conversionRate: totalOrders > 0 ? Number(((deliveredOrders / totalOrders) * 100).toFixed(1)) : 0,
    },
    recentOrders: orders.slice(0, 10),
    topSellingProducts,
  };
};

const getTeam = async (userId: string) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  const team = await prisma.teamOverride.findMany({
    where: { parentDistributorId: profile.id },
    include: {
      subDistributor: {
        include: {
          user: {
            select: { name: true, email: true, phoneNumber: true, avatar: true, createdAt: true },
          },
        },
      },
    },
  });

  return team;
};

const generateReferralLink = async (userId: string, payload: IGenerateReferralPayload) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  const baseUrl = payload.baseUrl || 'https://wellora.com.bd';
  let fullUrl = `${baseUrl}?ref=${profile.referralCode}&campaign=${encodeURIComponent(payload.campaignTag)}`;

  if (payload.productId) {
    const product = await prisma.product.findUnique({ where: { id: payload.productId } });
    if (product) {
      fullUrl = `${baseUrl}/product/${product.slug}?ref=${profile.referralCode}&campaign=${encodeURIComponent(payload.campaignTag)}`;
    }
  }

  return await prisma.referralLink.create({
    data: {
      distributorId: profile.id,
      productId: payload.productId || null,
      campaignTag: payload.campaignTag,
      referralCode: profile.referralCode,
      fullUrl,
    },
    include: {
      product: { select: { id: true, name: true, image: true, slug: true } },
    },
  });
};

const getReferralLinks = async (userId: string) => {
  const profile = await prisma.distributorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Distributor profile not found');
  }

  return await prisma.referralLink.findMany({
    where: { distributorId: profile.id },
    include: {
      product: { select: { id: true, name: true, image: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const DistributorService = {
  getMyProfile,
  updatePayoutDetails,
  getWalletSummary,
  requestWithdrawal,
  getAnalytics,
  getTeam,
  generateReferralLink,
  getReferralLinks,
};
