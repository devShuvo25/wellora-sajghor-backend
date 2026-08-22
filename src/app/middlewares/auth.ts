import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../errors/AppError';
import prisma from '../utils/prisma';
import { verifyToken } from '../utils/verifyToken';
import { Role, UserStatus } from '@prisma/client';

const auth = (...roles: Role[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Authorization token missing',
        );
      }

      // Bearer TOKEN
      const token = authorization.startsWith('Bearer ')
        ? authorization.split(' ')[1]
        : authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifyUserToken = verifyToken(
        token,
        config.jwt.access_secret as Secret,
      );

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: {
          id: verifyUserToken.id,
        },
      });

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User no longer exists!');
      }

      if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, 'Your account has been suspended!');
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action!');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
