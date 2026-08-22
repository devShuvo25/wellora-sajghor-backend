import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ICreateCategory, IUpdateCategory } from './category.interface';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createCategory = async (payload: ICreateCategory) => {
  const slug = payload.slug || slugify(payload.name);

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: payload.name }, { slug }],
    },
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'Category with this name or slug already exists');
  }

  return await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
};

const getCategoryByIdOrSlug = async (identifier: string) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      products: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return category;
};

const updateCategory = async (id: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const updateData = { ...payload };
  if (payload.name && !payload.slug) {
    updateData.slug = slugify(payload.name);
  }

  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (category._count.products > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete category containing products. Reassign or delete products first.',
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully' };
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
};