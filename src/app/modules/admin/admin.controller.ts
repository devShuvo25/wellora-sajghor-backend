import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.service';
import pickValidFields from '../../utils/pickValidFields';

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

const getAllDistributors = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, ['searchTerm', 'tier', 'status', 'page', 'limit']);
  const result = await AdminService.getAllDistributors(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Distributors retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateDistributor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.updateDistributor(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Distributor updated successfully',
    data: result,
  });
});

const getAllWalletTransactions = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, ['status', 'type', 'distributorId', 'page', 'limit']);
  const result = await AdminService.getAllWalletTransactions(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet transactions retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateWalletTransactionStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.updateWalletTransactionStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction status updated successfully',
    data: result,
  });
});

const getSystemSettings = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getSystemSettings();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System settings retrieved successfully',
    data: result,
  });
});

const updateSystemSetting = catchAsync(async (req: Request, res: Response) => {
  const { key, value, description } = req.body;
  const result = await AdminService.updateSystemSetting(key, value, description);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System setting updated successfully',
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,
  getAllDistributors,
  updateDistributor,
  getAllWalletTransactions,
  updateWalletTransactionStatus,
  getSystemSettings,
  updateSystemSetting,
};
