import express from 'express';
import auth from '../../middlewares/auth';
import { AdminController } from './admin.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// All Admin routes require ADMIN role
router.use(auth(Role.ADMIN));

router.get('/stats', AdminController.getDashboardStats);

router.get('/distributors', AdminController.getAllDistributors);
router.patch('/distributors/:id', AdminController.updateDistributor);

router.get('/wallet-transactions', AdminController.getAllWalletTransactions);
router.patch('/wallet-transactions/:id/status', AdminController.updateWalletTransactionStatus);

router.get('/settings', AdminController.getSystemSettings);
router.patch('/settings', AdminController.updateSystemSetting);

export const AdminRoutes = router;
