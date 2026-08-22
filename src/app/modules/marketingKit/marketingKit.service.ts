import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { AssetType, Prisma } from '@prisma/client';

export interface IMarketingKitFilter {
  category?: string;
  formatType?: string;
  type?: AssetType;
  status?: string;
  searchTerm?: string;
}

const getAllMarketingKits = async (filters: IMarketingKitFilter) => {
  const andConditions: Prisma.MarketingKitWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { caption: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.formatType) {
    andConditions.push({ formatType: filters.formatType });
  }

  if (filters.type) {
    andConditions.push({ type: filters.type });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  const whereCondition: Prisma.MarketingKitWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return await prisma.marketingKit.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
  });
};

const getMarketingKitById = async (id: string) => {
  const kit = await prisma.marketingKit.findUnique({ where: { id } });
  if (!kit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Marketing Kit not found');
  }
  return kit;
};

const createMarketingKit = async (payload: any) => {
  return await prisma.marketingKit.create({
    data: payload,
  });
};

const updateMarketingKit = async (id: string, payload: any) => {
  const kit = await prisma.marketingKit.findUnique({ where: { id } });
  if (!kit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Marketing Kit not found');
  }

  return await prisma.marketingKit.update({
    where: { id },
    data: payload,
  });
};

const deleteMarketingKit = async (id: string) => {
  const kit = await prisma.marketingKit.findUnique({ where: { id } });
  if (!kit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Marketing Kit not found');
  }

  await prisma.marketingKit.delete({ where: { id } });
  return { message: 'Marketing Kit deleted successfully' };
};

const incrementDownload = async (id: string) => {
  return await prisma.marketingKit.update({
    where: { id },
    data: {
      downloadsCount: { increment: 1 },
    },
  });
};

export const MarketingKitService = {
  getAllMarketingKits,
  getMarketingKitById,
  createMarketingKit,
  updateMarketingKit,
  deleteMarketingKit,
  incrementDownload,
};
