import express from 'express';
import auth from '../../middlewares/auth';
import { LoyaltyController } from './loyalty.controller';

const router = express.Router();

router.use(auth());

router.get('/my-points', LoyaltyController.getMyPoints);
router.post('/redeem', LoyaltyController.redeemPoints);

export const LoyaltyRoutes = router;
