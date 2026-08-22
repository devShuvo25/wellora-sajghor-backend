import { ProgramEnum } from '@prisma/client';

export interface ICreateDepartment {
  id: string;
  icon?: string;
  image?: string;
  name: string;
  program: ProgramEnum;
}

export interface IUpdateDepartment {
  name?: string;
  icon?: string;
  image?: string;
  program?: ProgramEnum;
}
