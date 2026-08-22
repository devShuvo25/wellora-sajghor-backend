// user.controller.ts
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import prisma from '../../utils/prisma';

// user.controller.ts

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // Extract page and limit from query params
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await UserServices.getAllUsersFromDB({ page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    // If you return { data, meta }, keep it like this
    data: result.data,
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
      totalPage: result.meta.totalPages,
    },
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

const assignCategoriesToUser = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { categoryIds } = req.body;
    const result = await UserServices.assignCategoriesToUserDB(id, categoryIds);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Categories assigned to user successfully',
      data: result,
    });
  },
);

// GET MY PROFILE
// ===============================
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  // req.user should be populated by auth middleware
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Unauthorized',
      data: null,
    });
  }

  //  const profile = await prisma.user.findUnique({
  //   where: { id: userId },
  //   select: {
  //     id: true,
  //     firstName: true,
  //     lastName: true,
  //     email: true,
  //     role: true,
  //     status: true,
  //     position: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     categories: {
  //       select: {
  //         id: true,
  //         name: true,
  //       },
  //     },
  //   },
  // });

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      program: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      categories: {
        select: {
          id: true,
          name: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },

      adminPermission: {
        select: {
          categoryCreate: true,
          categoryUpdate: true,
          categoryDelete: true,
          userCreate: true,
          userAssignCategory: true,
          documentUpload: true,
          documentUpdate: true,
          documentDelete: true,
        },
      },
    },
  });

  if (!profile) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'Profile not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: profile,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignCategoriesToUser,
  getMyProfile,
};
