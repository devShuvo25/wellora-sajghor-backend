import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import { OrderValidation } from './order.validation';
import { Role } from '@prisma/client';

const router = express.Router();

// Storefront checkout (Guest or Authenticated)
router.post(
  '/',
  (req, res, next) => {
    if (req.headers.authorization) {
      return auth()(req, res, next);
    }
    next();
  },
  validateRequest(OrderValidation.createCustomerOrderValidationSchema),
  OrderController.createOrder,
);

// Distributor Portal direct order creation
router.post(
  '/distributor',
  auth(Role.DISTRIBUTOR, Role.ADMIN),
  validateRequest(OrderValidation.createCustomerOrderValidationSchema),
  OrderController.createDistributorOrder,
);

// Customer order history
router.get('/my-orders', auth(), OrderController.getMyOrders);

// Single order view
router.get('/:id', auth(), OrderController.getOrderById);

// Admin order management
router.get('/', auth(Role.ADMIN), OrderController.getAllOrders);

router.patch(
  '/:id/status',
  auth(Role.ADMIN),
  validateRequest(OrderValidation.updateOrderStatusValidationSchema),
  OrderController.updateOrderStatus,
);

export const OrderRoutes = router;
