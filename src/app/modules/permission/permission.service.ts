// permission.service.ts
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { IUpdatePermissions } from './permission.interface';

const getPermissionsForAdminFromDB = async (userId: string) => {
  const permission = await prisma.adminPermission.findUnique({
    where: { userId },
  });
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permissions not found for this admin');
  }
  return permission;
};

const updatePermissionsForAdminIntoDB = async (userId: string, payload: IUpdatePermissions) => {
  const permission = await prisma.adminPermission.findUnique({
    where: { userId },
  });
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permissions not found for this admin');
  }
  return await prisma.adminPermission.update({
    where: { userId },
    data: payload,
  });
};

export const PermissionServices = {
  getPermissionsForAdminFromDB,
  updatePermissionsForAdminIntoDB,
};