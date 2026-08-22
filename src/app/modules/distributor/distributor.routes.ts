import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DistributorController } from './distributor.controller';
import { DistributorValidation } from './distributor.validation';
import { Role } from '@prisma/client';

const router = express.Router();

// All distributor routes require DISTRIBUTOR or ADMIN role
router.use(auth(Role.DISTRIBUTOR, Role.ADMIN));

router.get('/me', DistributorController.getMyProfile);

router.patch(
  '/payout-details',
  validateRequest(DistributorValidation.updatePayoutDetailsValidationSchema),
  DistributorController.updatePayoutDetails,
);

router.get('/wallet', DistributorController.getWalletSummary);

router.post(
  '/wallet/withdraw',
  validateRequest(DistributorValidation.withdrawalRequestValidationSchema),
  DistributorController.requestWithdrawal,
);

router.get('/analytics', DistributorController.getAnalytics);

router.get('/team', DistributorController.getTeam);

router.post(
  '/referrals/generate',
  validateRequest(DistributorValidation.generateReferralValidationSchema),
  DistributorController.generateReferralLink,
);

router.get('/referrals', DistributorController.getReferralLinks);

export const DistributorRoutes = router;
