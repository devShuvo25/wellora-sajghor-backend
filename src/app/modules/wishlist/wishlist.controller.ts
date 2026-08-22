import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WishlistService } from './wishlist.service';

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await WishlistService.getWishlist(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result,
  });
});

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;
  const result = await WishlistService.addToWishlist(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product added to wishlist',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  const result = await WishlistService.removeFromWishlist(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const WishlistController = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
