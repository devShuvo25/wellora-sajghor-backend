import { UserRoleEnum, UserStatus } from "@prisma/client";

// user.types.ts
export type IUpdateUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRoleEnum;
  status?: UserStatus;
};

export type IAssignCategories = {
  categoryIds: string[];
};

