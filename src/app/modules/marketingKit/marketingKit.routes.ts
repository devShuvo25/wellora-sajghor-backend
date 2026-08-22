import express from 'express';
import auth from '../../middlewares/auth';
import { MarketingKitController } from './marketingKit.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// Public / Partner listing
router.get('/', MarketingKitController.getAllMarketingKits);
router.get('/:id', MarketingKitController.getMarketingKitById);
router.post('/:id/download', MarketingKitController.incrementDownload);

// Admin Management
router.post('/', auth(Role.ADMIN), MarketingKitController.createMarketingKit);
router.patch('/:id', auth(Role.ADMIN), MarketingKitController.updateMarketingKit);
router.delete('/:id', auth(Role.ADMIN), MarketingKitController.deleteMarketingKit);

export const MarketingKitRoutes = router;
