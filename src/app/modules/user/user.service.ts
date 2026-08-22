import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../../config';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { IAddressPayload, IUpdateProfile, IUserFilterOptions } from './user.interface';
import { Prisma, Role, UserStatus } from '@prisma/client';

const getAllUsers = async (filters: IUserFilterOptions) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { email: { contains: filters.searchTerm, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.role) {
    andConditions.push({ role: filters.role });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  const whereCondition: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        distributorProfile: {
          select: {
            id: true,
            tier: true,
            referralCode: true,
            totalSales: true,
            availableBalance: true,
          },
        },
        loyaltyAccount: {
          select: {
            availablePoints: true,
            currentTier: true,
          },
        },
      },
    }),
    prisma.user.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
      addresses: true,
      distributorProfile: true,
      loyaltyAccount: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateProfile = async (userId: string, payload: IUpdateProfile) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updateData: Prisma.UserUpdateInput = {};

  if (payload.name) updateData.name = payload.name;
  if (payload.phoneNumber) updateData.phoneNumber = payload.phoneNumber;
  if (payload.avatar) updateData.avatar = payload.avatar;

  if (payload.newPassword) {
    if (!payload.oldPassword) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Old password is required to set a new password');
    }

    const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Old password does not match');
    }

    updateData.password = await bcrypt.hash(
      payload.newPassword,
      Number(config.bcrypt_salt_rounds) || 12,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      status: true,
      avatar: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const updateUserStatusAndRole = async (
  userId: string,
  payload: { status?: UserStatus; role?: Role },
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

const addAddress = async (userId: string, payload: IAddressPayload) => {
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return await prisma.address.create({
    data: {
      userId,
      ...payload,
    },
  });
};

const getUserAddresses = async (userId: string) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
};

const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found');
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return { message: 'Address deleted successfully' };
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserStatusAndRole,
  addAddress,
  getUserAddresses,
  deleteAddress,
};