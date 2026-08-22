import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';
import pickValidFields from '../../utils/pickValidFields';
import { Role } from '@prisma/client';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user ? req.user.id : null;
  const result = await OrderService.createCustomerOrder(customerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order placed successfully',
    data: result,
  });
});

const createDistributorOrder = catchAsync(async (req: Request, res: Response) => {
  const distributorUserId = req.user!.id;
  const result = await OrderService.createDistributorOrder(distributorUserId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Distributor order placed successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await OrderService.getOrdersByUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My orders retrieved successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.role === Role.ADMIN;
  const result = await OrderService.getOrderById(id, userId, isAdmin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, [
    'searchTerm',
    'status',
    'paymentStatus',
    'channel',
    'distributorId',
    'startDate',
    'endDate',
    'page',
    'limit',
  ]);
  const result = await OrderService.getAllOrders(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderService.updateOrderStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  createDistributorOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
