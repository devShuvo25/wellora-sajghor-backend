// user.service.ts
import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { IUpdateUser } from './user.interface';

// user.service.ts

interface IGetAllUsersParams {
  page?: number;
  limit?: number;
}

const getAllUsersFromDB = async (params?: IGetAllUsersParams) => {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : 5;
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const getUserByIdFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const updateUserIntoDB = async (id: string, payload: IUpdateUser) => {
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }
  const user = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });
  // If changing to ADMIN, create AdminPermission if not exists
  if (payload.role === 'ADMIN') {
    const existingPerm = await prisma.adminPermission.findUnique({ where: { userId: id } });
    if (!existingPerm) {
      await prisma.adminPermission.create({
        data: { userId: id },
      });
    }
  }
  return user;
};

const deleteUserFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  await prisma.user.delete({ where: { id } });
  return { id };
};

const assignCategoriesToUserDB = async (userId: string, categoryIds: string[]) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Validate categories exist
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  if (categories.length !== categoryIds.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Some categories not found');
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      categories: {
        set: categoryIds.map(id => ({ id })),
      },
    },
  });
  return { userId, assignedCategories: categoryIds };
};

export const UserServices = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
  assignCategoriesToUserDB,
};