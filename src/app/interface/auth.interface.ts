import { JwtPayload } from 'jsonwebtoken';

export interface ITokenUser {
  id: string;
  universityId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  program: string;
  departmentId: string;
}

export interface IDecodedUser extends JwtPayload, ITokenUser {}
