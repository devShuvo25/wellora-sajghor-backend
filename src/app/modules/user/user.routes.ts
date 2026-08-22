import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { Role } from '@prisma/client';

const router = express.Router();

// Current User Profile & Addresses
router.get('/me', auth(), (req, res, next) => {
  req.params.id = req.user!.id;
  UserController.getUserById(req, res, next);
});

router.patch(
  '/me',
  auth(),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateProfile,
);

router.post(
  '/address',
  auth(),
  validateRequest(UserValidation.addressValidationSchema),
  UserController.addAddress,
);

router.get('/address', auth(), UserController.getUserAddresses);

router.delete('/address/:addressId', auth(), UserController.deleteAddress);

// Admin Routes
router.get('/', auth(Role.ADMIN), UserController.getAllUsers);

router.get('/:id', auth(Role.ADMIN), UserController.getUserById);

router.patch(
  '/:id/status',
  auth(Role.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatusAndRole,
);

export const UserRoutes = router;
