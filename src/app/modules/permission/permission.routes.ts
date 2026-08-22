// permission.route.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PermissionController } from './permission.controller';
import { permissionValidation } from './permission.validation';

const router = express.Router();

router.get('/:userId', PermissionController.getPermissionsForAdmin); // Add auth('SUPERADMIN')

router.patch(
  '/:userId',
  validateRequest(permissionValidation.updatePermissions),
  PermissionController.updatePermissionsForAdmin
); // Add auth('SUPERADMIN')

export const PermissionRoutes = router;