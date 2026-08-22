import express from 'express';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './department.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DepartmentControllers } from './department.controller';

const router = express.Router();

// ✅ Department Management Routes
// Only ADMIN or SUPERADMIN can manage departments

// Create a new department
router.post(
  '/',
  auth('ADMIN', 'SUPERADMIN'),
//   validateRequest(createDepartmentSchema),
  DepartmentControllers.createDepartment
);

// Get all departments (public or optional auth)
router.get('/', DepartmentControllers.getDepartments);

// Get a single department by ID (public or optional auth)
router.get('/:id', DepartmentControllers.getDepartmentById);

// Update a department by ID
router.patch(
  '/:id',
  auth('ADMIN', 'SUPERADMIN'),
//   validateRequest(updateDepartmentSchema),
  DepartmentControllers.updateDepartment
);

// Delete a department by ID
router.delete(
  '/:id',
  auth('ADMIN', 'SUPERADMIN'),
  DepartmentControllers.deleteDepartment
);

export const DepartmentRoutes = router;
