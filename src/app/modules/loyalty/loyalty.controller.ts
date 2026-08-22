import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { LoyaltyService } from './loyalty.service';

const getMyPoints = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await LoyaltyService.getMyPoints(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Loyalty points retrieved successfully',
    data: result,
  });
});

const redeemPoints = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { points } = req.body;
  const result = await LoyaltyService.redeemPoints(userId, Number(points));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const LoyaltyController = {
  getMyPoints,
  redeemPoints,
};
