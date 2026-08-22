import express from 'express';
import auth from '../../middlewares/auth';
import { DashboardController } from './dashboard.controller';
import { Role } from '@prisma/client/wasm';

const router = express.Router();

router.get('/statistics', auth(Role.ADMIN), DashboardController.getStatistics);

export const DashboardRoutes = router;
