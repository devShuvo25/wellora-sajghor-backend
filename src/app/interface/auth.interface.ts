import { Role, UserStatus } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

export interface ITokenUser {
  id: string;
  email: string;
  role: Role;
  status?: UserStatus;
}

export interface IDecodedUser extends JwtPayload, ITokenUser {}
