import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { ICreateProduct, ICreateReview, IProductFilterOptions, IUpdateProduct } from './product.interface';
import { Prisma } from '@prisma/client';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createProduct = async (payload: ICreateProduct) => {
  const { galleryImages, ...productData } = payload;
  const slug = productData.slug || slugify(productData.name);

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new AppError(httpStatus.CONFLICT, 'Product with this slug or name already exists');
  }

  // Ensure category exists
  const category = await prisma.category.findUnique({
    where: { id: productData.categoryId },
  });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return await prisma.product.create({
    data: {
      ...productData,
      slug,
      galleryImages: galleryImages && galleryImages.length > 0
        ? {
            create: galleryImages,
          }
        : undefined,
    },
    include: {
      category: true,
      galleryImages: true,
    },
  });
};

const getProducts = async (filters: IProductFilterOptions) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 12;
  const skip = (page - 1) * limit;

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { brand: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.categoryId) {
    andConditions.push({ categoryId: filters.categoryId });
  }

  if (filters.categorySlug) {
    andConditions.push({ category: { slug: filters.categorySlug } });
  }

  if (filters.brand) {
    andConditions.push({ brand: { equals: filters.brand, mode: 'insensitive' } });
  }

  if (filters.skinType) {
    andConditions.push({ skinType: { has: filters.skinType } });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    andConditions.push({
      price: {
        gte: filters.minPrice ? Number(filters.minPrice) : undefined,
        lte: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      },
    });
  }

  if (filters.isTrending !== undefined) {
    andConditions.push({ isTrending: String(filters.isTrending) === 'true' });
  }

  if (filters.inStock !== undefined) {
    andConditions.push({ inStock: String(filters.inStock) === 'true' });
  }

  const whereCondition: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (filters.sortBy === 'price-low') {
    orderBy = { price: 'asc' };
  } else if (filters.sortBy === 'price-high') {
    orderBy = { price: 'desc' };
  } else if (filters.sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (filters.sortBy === 'rating') {
    orderBy = { rating: 'desc' };
  } else if (filters.sortBy === 'popular') {
    orderBy = { reviewsCount: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        galleryImages: true,
      },
    }),
    prisma.product.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: products,
  };
};

const getProductByIdOrSlug = async (identifier: string) => {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      category: true,
      galleryImages: true,
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};

const updateProduct = async (id: string, payload: IUpdateProduct) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const updateData = { ...payload };
  if (payload.name && !payload.slug) {
    updateData.slug = slugify(payload.name);
  }

  return await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      galleryImages: true,
    },
  });
};

const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted successfully' };
};

const createProductReview = async (
  userId: string,
  productId: string,
  payload: ICreateReview,
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const review = await prisma.productReview.create({
    data: {
      userId,
      productId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  // Recalculate average rating & reviewsCount
  const aggregations = await prisma.productReview.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Number((aggregations._avg.rating || 5.0).toFixed(1)),
      reviewsCount: aggregations._count.rating || 1,
    },
  });

  return review;
};

const getProductReviews = async (productId: string) => {
  return await prisma.productReview.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const ProductService = {
  createProduct,
  getProducts,
  getProductByIdOrSlug,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
};
