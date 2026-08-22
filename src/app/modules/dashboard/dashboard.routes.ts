import express from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/statistics",
  auth(),
  DashboardController.getStatistics
);

export const DashboardRoutes = router;
