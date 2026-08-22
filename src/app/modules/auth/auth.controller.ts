// auth.controller.ts (adding registerUser)
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    // message: 'OTP sent successfully',
        message: 'User registered successfully',

    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyOtpAndCreateUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Account verified successfully',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const result = await AuthServices.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});
export const AuthController = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
};
