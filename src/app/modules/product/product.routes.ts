import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import { Role } from '@prisma/client/wasm';

const router = express.Router();

// Public Product Routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductByIdOrSlug);
router.get('/:productId/reviews', ProductController.getProductReviews);

// Customer Review Route
router.post(
  '/:productId/reviews',
  auth(),
  validateRequest(ProductValidation.reviewValidationSchema),
  ProductController.createProductReview,
);

// Admin Product Routes
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductController.createProduct,
);

router.patch(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductController.updateProduct,
);

router.delete('/:id', auth(Role.ADMIN), ProductController.deleteProduct);

export const ProductRoutes = router;
