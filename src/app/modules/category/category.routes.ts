// category.route.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { categoryValidation } from './category.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(categoryValidation.createCategory),
  CategoryController.createCategory
); // Add auth('SUPERADMIN', 'ADMIN')

router.get('/', CategoryController.getAllCategories); // Add auth()

router.get('/:id', CategoryController.getCategoryById); // Add auth()

router.patch(
  '/:id',
  validateRequest(categoryValidation.updateCategory),
  CategoryController.updateCategory
); // Add auth('SUPERADMIN', 'ADMIN')

router.delete('/:id', CategoryController.deleteCategory); // Add auth('SUPERADMIN', 'ADMIN')

export const CategoryRoutes = router;