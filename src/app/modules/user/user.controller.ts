import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import pickValidFields from '../../utils/pickValidFields';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'role',
    'status',
    'page',
    'limit',
    'sortBy',
    'sortOrder',
  ]);
  const result = await UserServices.getAllUsers(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await UserServices.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateUserStatusAndRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserStatusAndRole(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status/role updated successfully',
    data: result,
  });
});

const addAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await UserServices.addAddress(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});

const getUserAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await UserServices.getUserAddresses(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Addresses retrieved successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { addressId } = req.params;
  const result = await UserServices.deleteAddress(userId, addressId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserStatusAndRole,
  addAddress,
  getUserAddresses,
  deleteAddress,
};
