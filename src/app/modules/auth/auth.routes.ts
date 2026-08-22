import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

// ── Public auth routes ──────────────────────────────────────────────────────

// Step 1: Register → user gets OTP by email (status = PENDING)
router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

// Step 2: Verify OTP → user activated + tokens issued
router.post(
  '/verify-otp',
  validateRequest(AuthValidation.verifyOtpValidationSchema),
  AuthController.verifyOtp,
);

// Resend OTP (rate-limited to once per minute)
router.post(
  '/resend-otp',
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthController.resendOtp,
);

// Login (only verified users can login)
router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

// Refresh access token
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshAccessToken,
);

// Forgot password → sends reset OTP
router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

// Reset password with OTP
router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

// Logout
router.post('/logout', AuthController.logout);

// ── Protected routes ────────────────────────────────────────────────────────

router.get('/me', auth(), AuthController.getMe);

export const AuthRoutes = router;
