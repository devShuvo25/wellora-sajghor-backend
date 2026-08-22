import { z } from 'zod';

const createProductValidationSchema = z.object({
  body: z.object({
    brand: z.string({ required_error: 'Brand is required' }),
    name: z.string({ required_error: 'Product name is required' }),
    slug: z.string().optional(),
    categoryId: z.string({ required_error: 'Category ID is required' }),
    price: z.number({ required_error: 'Price is required' }).positive(),
    comparePrice: z.number().positive().optional(),
    points: z.number().int().nonnegative().optional(),
    image: z.string({ required_error: 'Main product image URL is required' }),
    altText: z.string().optional(),
    description: z.string({ required_error: 'Description is required' }),
    volume: z.string().optional(),
    keyIngredients: z.array(z.string()).optional(),
    skinType: z.array(z.string()).optional(),
    isTrending: z.boolean().optional(),
    inStock: z.boolean().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    distributorCommissionRate: z.number().min(0).max(1).optional(),
    galleryImages: z
      .array(
        z.object({
          url: z.string().url(),
          altText: z.string().optional(),
          isPrimary: z.boolean().optional(),
        }),
      )
      .optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    brand: z.string().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
    categoryId: z.string().optional(),
    price: z.number().positive().optional(),
    comparePrice: z.number().positive().optional(),
    points: z.number().int().nonnegative().optional(),
    image: z.string().optional(),
    altText: z.string().optional(),
    description: z.string().optional(),
    volume: z.string().optional(),
    keyIngredients: z.array(z.string()).optional(),
    skinType: z.array(z.string()).optional(),
    isTrending: z.boolean().optional(),
    inStock: z.boolean().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    distributorCommissionRate: z.number().min(0).max(1).optional(),
  }),
});

const reviewValidationSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string({ required_error: 'Review comment is required' }).min(3),
  }),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
  reviewValidationSchema,
};
