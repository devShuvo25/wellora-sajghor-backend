import { ProgramEnum, UserRoleEnum } from '@prisma/client';

export interface IRegisterUser {
  firstName: string;
  lastName: string;
  universityId?: string;
  program: ProgramEnum;
  departmentId: string;
  email: string;
  role: UserRoleEnum; // STUDENT | TEACHER
  password?: string;
}

export interface IVerifyOtp {
  email: string;
  otp: string;
  password: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};
export type IForgotPassword = {
  email: string;
};
export type IResetPassword = {
  email: string;
  otp: string;
  newPassword: string;
};
export type IUpdateProfile = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  age?: number;
};
