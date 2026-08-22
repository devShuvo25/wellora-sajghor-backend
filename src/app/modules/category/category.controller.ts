// category.controller.ts
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryServices } from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategoryIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Category created successfully',
    data: result,
  }); 
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getAllCategoriesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.getCategoryByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.updateCategoryIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CategoryServices.deleteCategoryFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};