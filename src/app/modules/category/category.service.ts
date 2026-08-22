// category.service.ts
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ICreateCategory, IUpdateCategory } from './category.interface';

const createCategoryIntoDB = async (payload: ICreateCategory) => {
  return await prisma.category.create({
    data: payload,
  });
};

const getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany();
};

const getCategoryByIdFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

const updateCategoryIntoDB = async (id: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await prisma.category.delete({ where: { id } });
  return { id };
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getCategoryByIdFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};