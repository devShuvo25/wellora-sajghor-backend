import { Request, Response } from "express";
import httpStatus from "http-status";
import { DashboardService } from "./dashboard.service";

const getStatistics = async (req: Request, res: Response) => {
  const result = await DashboardService.getStatistics();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
};

export const DashboardController = {
  getStatistics,
};
