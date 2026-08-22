import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MarketingKitService } from './marketingKit.service';
import pickValidFields from '../../utils/pickValidFields';

const getAllMarketingKits = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, ['category', 'formatType', 'type', 'status', 'searchTerm']);
  const result = await MarketingKitService.getAllMarketingKits(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marketing kits retrieved successfully',
    data: result,
  });
});

const getMarketingKitById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MarketingKitService.getMarketingKitById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marketing kit retrieved successfully',
    data: result,
  });
});

const createMarketingKit = catchAsync(async (req: Request, res: Response) => {
  const result = await MarketingKitService.createMarketingKit(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Marketing kit created successfully',
    data: result,
  });
});

const updateMarketingKit = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MarketingKitService.updateMarketingKit(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marketing kit updated successfully',
    data: result,
  });
});

const deleteMarketingKit = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MarketingKitService.deleteMarketingKit(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const incrementDownload = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await MarketingKitService.incrementDownload(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Download count incremented',
    data: result,
  });
});

export const MarketingKitController = {
  getAllMarketingKits,
  getMarketingKitById,
  createMarketingKit,
  updateMarketingKit,
  deleteMarketingKit,
  incrementDownload,
};
