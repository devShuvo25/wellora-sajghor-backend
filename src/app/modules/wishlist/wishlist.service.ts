import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';

const getWishlist = async (userId: string) => {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items;
};

const addToWishlist = async (userId: string, productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (existing) {
    return existing;
  }

  return await prisma.wishlist.create({
    data: {
      userId,
      productId,
    },
    include: { product: true },
  });
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product is not in your wishlist');
  }

  await prisma.wishlist.delete({
    where: {
      userId_productId: { userId, productId },
    },
  });

  return { message: 'Product removed from wishlist' };
};

export const WishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
