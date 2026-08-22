import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "./department.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";


const createDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.createDepartment(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Department created successfully",
      data: department,
    });
  }
);

const getDepartments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
 const filters = {
    searchTerm: req.query.searchTerm,
    program: req.query.program as string, 
  };
    const departments = await DepartmentService.getDepartments(filters);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: departments,
    });
  }
);

const getDepartmentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.getDepartmentById(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: department,
    });
  }
);

const updateDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const department = await DepartmentService.updateDepartment(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Department updated successfully",
      data: department,
    });
  }
);

const deleteDepartment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await DepartmentService.deleteDepartment(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Department deleted successfully",
      data: null,
    });
  }
);

export const DepartmentControllers = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
