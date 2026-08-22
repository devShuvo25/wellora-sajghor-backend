import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { LoyaltyTransactionType } from '@prisma/client';

const getMyPoints = async (userId: string) => {
  let account = await prisma.loyaltyAccount.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!account) {
    // Create loyalty account if doesn't exist
    account = await prisma.loyaltyAccount.create({
      data: {
        userId,
        availablePoints: 0,
        totalEarnedPoints: 0,
        currentTier: 'VIP Bronze',
        nextTierPoints: 600,
      },
      include: {
        transactions: true,
      },
    });
  }

  const pointsToNextTier = Math.max(0, account.nextTierPoints - account.totalEarnedPoints);

  return {
    availablePoints: account.availablePoints,
    totalEarnedPoints: account.totalEarnedPoints,
    currentTier: account.currentTier,
    nextTierPoints: account.nextTierPoints,
    pointsToNextTier,
    discountValueBDT: account.availablePoints, // 1 point = 1 BDT
    transactions: account.transactions,
  };
};

const redeemPoints = async (userId: string, points: number) => {
  if (points <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Points to redeem must be greater than 0');
  }

  const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
  if (!account || account.availablePoints < points) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient points. You have ${account?.availablePoints || 0} points available.`,
    );
  }

  return {
    success: true,
    pointsRedeemed: points,
    discountAmountBDT: points,
    message: `৳${points} discount applied from loyalty points`,
  };
};

export const LoyaltyService = {
  getMyPoints,
  redeemPoints,
};
