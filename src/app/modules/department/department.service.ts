import prisma from '../../utils/prisma';
import httpStatus from 'http-status';
import { ICreateDepartment, IUpdateDepartment } from './department.interface';
import AppError from '../../errors/AppError';
import { equal } from 'assert';

const createDepartment = async (payload: ICreateDepartment) => {
  // Check if department with same name & program exists
  const existing = await prisma.department.findFirst({
    where: { name: payload.name, program: payload.program },
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, 'Department already exists');
  }

  // Create department
  const department = await prisma.department.create({
    data: {
      name: payload.name,
      program: payload.program,
      icon: payload.icon,   // optional
      image: payload.image, // optional
    },
  });

  return {
    id: department.id,
    name: department.name,
    program: department.program,
    icon: department.icon,
    image: department.image,
  };
};

const getDepartments = async (filters : any) => {
  const whereConditions : any = {
    name: {not: "ADMIN"},
  }
  if(filters.searchTerm){
    whereConditions.name = {
      ...whereConditions.name,
      contains : filters.searchTerm,
      mode: "insensitive"
    }
  }
  if(filters.program){
    whereConditions.program = {
      equals:filters.program
    }
  }
  // Step 1: Get unique department names (exclude ADMIN)
  const departments = await prisma.department.findMany({
    where: whereConditions,
    distinct: ['name'],
    select: {
      id: true,
      name: true,
      icon: true,
      image: true,
    },
  });

  // Step 2: Get programs for each department
  const result = await Promise.all(
    departments.map(async (dept) => {
      const programs = await prisma.department.findMany({
        where: { name: dept.name, NOT: { name: 'ADMIN' } },
        select: { program: true },
      });

      return {
        id: dept.id,
        name: dept.name,
        icon: dept.icon,
        image: dept.image,
        programs: [...new Set(programs.map((p) => p.program))],
      };
    }),
  );

  return result;
};

const getDepartmentById = async (id: string) => {
  // Find department by ID
  const department = await prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      icon: true,
      image: true,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, 'Department not found');
  }

  // Get all programs under same department name
  const programsData = await prisma.department.findMany({
    where: { name: department.name },
    select: { program: true },
  });

  return {
    id: department.id,
    name: department.name,
    icon: department.icon,
    image: department.image,
    programs: [...new Set(programsData.map((p) => p.program))],
  };
};

const updateDepartment = async (id: string, payload: IUpdateDepartment) => {
  const department = await prisma.department.findUnique({ where: { id } });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, 'Department not found');
  }

  // Conflict check
  if (payload.name || payload.program) {
    const conflict = await prisma.department.findFirst({
      where: {
        name: payload.name ?? department.name,
        program: payload.program ?? department.program,
        NOT: { id },
      },
    });

    if (conflict) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another department with same name & program exists',
      );
    }
  }

  // Update department
  const updatedDepartment = await prisma.department.update({
    where: { id },
    data: {
      name: payload.name,
      program: payload.program,
      icon: payload.icon,   // optional
      image: payload.image, // optional
    },
  });

  // Get all programs under same department name
  const programsData = await prisma.department.findMany({
    where: { name: updatedDepartment.name },
    select: { program: true },
  });

  return {
    id: updatedDepartment.id,
    name: updatedDepartment.name,
    icon: updatedDepartment.icon,
    image: updatedDepartment.image,
    programs: [...new Set(programsData.map((p) => p.program))],
  };
};

const deleteDepartment = async (id: string) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, 'Department not found');
  }

  return prisma.department.delete({ where: { id } });
};

export const DepartmentService = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
