import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DistributorService } from './distributor.service';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Distributor profile retrieved successfully',
    data: result,
  });
});

const updatePayoutDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.updatePayoutDetails(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payout details updated successfully',
    data: result,
  });
});

const getWalletSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.getWalletSummary(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet summary retrieved successfully',
    data: result,
  });
});

const requestWithdrawal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.requestWithdrawal(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Withdrawal request submitted successfully',
    data: result,
  });
});

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.getAnalytics(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Distributor analytics retrieved successfully',
    data: result,
  });
});

const getTeam = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.getTeam(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sub-affiliates team retrieved successfully',
    data: result,
  });
});

const generateReferralLink = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.generateReferralLink(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Referral link generated successfully',
    data: result,
  });
});

const getReferralLinks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await DistributorService.getReferralLinks(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral links retrieved successfully',
    data: result,
  });
});

export const DistributorController = {
  getMyProfile,
  updatePayoutDetails,
  getWalletSummary,
  requestWithdrawal,
  getAnalytics,
  getTeam,
  generateReferralLink,
  getReferralLinks,
};
