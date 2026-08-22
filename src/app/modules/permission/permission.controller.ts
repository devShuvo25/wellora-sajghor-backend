// permission.controller.ts
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PermissionServices } from './permission.service';

const getPermissionsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await PermissionServices.getPermissionsForAdminFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Permissions retrieved successfully',
    data: result,
  });
});

const updatePermissionsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await PermissionServices.updatePermissionsForAdminIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Permissions updated successfully',
    data: result,
  });
});

export const PermissionController = {
  getPermissionsForAdmin,
  updatePermissionsForAdmin,
};