import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import path from 'path';
import fs from 'fs';
import { ProgramEnum } from '@prisma/client';

type Filters = {
  program?: string;
  departmentId?: string;
  searchTerm?: string
  academicYear?: string;
  categoryId? : string
};

// ✅ Create a new document
const createDocumentIntoDB = async (payload: any, uploadedById: string) => {
  const {
    title,
    description,
    categoryId,
    file,
    program,
    academicYear,
    departmentId,
  } = payload;

  if (!file) throw new AppError(httpStatus.BAD_REQUEST, 'No file provided');

  return await prisma.document.create({
    data: {
      title,
      description,
      filePath: file.path,
      fileName: file.originalname,
      fileType: file.mimetype.includes('pdf')
        ? 'PDF'
        : file.mimetype.includes('image')
          ? 'IMAGE'
          : 'DOCX',
      fileSize: file.size,
      categoryId,
      uploadedById,
      program,
      academicYear,
      departmentId,
      permission: payload.permission || 'VIEW_ONLY', // ✅ Required field added
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      category: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      program: true,
      academicYear: true,
      createdAt: true,
    },
  });
};

// ✅ Get all documents with filters & access control
const getAllDocumentsFromDB = async (
  userId: string,
  role: string,
  filters?: Filters,
) => {
  const whereClause: any = {};

  if (filters?.program) whereClause.program = filters.program;
  if(filters?.categoryId) whereClause.categoryId = filters.categoryId;
  if (filters?.departmentId) whereClause.departmentId = filters.departmentId;
  if (filters?.academicYear) whereClause.academicYear = filters.academicYear;
  if (filters?.searchTerm){
      whereClause.title = {
      contains : filters.searchTerm,
      mode: "insensitive"
      }
  }

  if (role === 'SUPERADMIN' || role === 'ADMIN') {
    return prisma.document.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
        department: { select: { id: true, name: true, program: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // USER: only documents in assigned categories + their department
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { categories: true, department: true },
  });
  const categoryIds = user?.categories.map(c => c.id) || [];

  whereClause.departmentId = user?.departmentId;
  whereClause.categoryId = { in: categoryIds };

  return prisma.document.findMany({
    where: whereClause,
    include: {
      category: { select: { id: true, name: true } },
      uploadedBy: { select: { firstName: true, lastName: true } },
      department: { select: { id: true, name: true, program: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// ✅ Get document by ID with access control
const getDocumentByIdFromDB = async (
  id: string,
  userId: string,
  role: string,
) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      category: true,
      uploadedBy: { select: { firstName: true, lastName: true } },
      department: { select: { id: true, name: true, program: true } },
    },
  });

  if (!document) throw new AppError(httpStatus.NOT_FOUND, 'Document not found');

  if (role === 'USER') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { categories: true },
    });
    const hasAccess = user?.categories.some(
      cat => cat.id === document.categoryId,
    );
    if (!hasAccess) throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
  }

  return document;
};

// ✅ Get document file path for download
const getDocumentFilePath = async (
  id: string,
  userId: string,
  role: string,
) => {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new AppError(httpStatus.NOT_FOUND, 'Document not found');

  if (role === 'USER') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { categories: true },
    });
    const hasAccess = user?.categories.some(
      cat => cat.id === document.categoryId,
    );
    if (!hasAccess) throw new AppError(httpStatus.FORBIDDEN, 'Access denied');

    // Only allow download if permission is DOWNLOAD
    if (document.permission === 'VIEW_ONLY') {
      throw new AppError(httpStatus.FORBIDDEN, 'Download not allowed');
    }
  }

  return path.resolve(document.filePath);
};

// ✅ Update document
const updateDocumentIntoDB = async (
  id: string,
  payload: any,
  userId: string,
) => {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new AppError(httpStatus.NOT_FOUND, 'Document not found');

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Only uploader or SUPERADMIN
  if (document.uploadedById !== userId && user?.role !== 'SUPERADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');
  }

  return prisma.document.update({
    where: { id },
    data: payload,
    include: { category: true, department: true },
  });
};

// ✅ Delete document
const deleteDocumentFromDB = async (id: string, userId: string) => {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new AppError(httpStatus.NOT_FOUND, 'Document not found');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'SUPERADMIN' && document.uploadedById !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized');
  }

  if (fs.existsSync(document.filePath)) fs.unlinkSync(document.filePath);

  await prisma.document.delete({ where: { id } });
  return { id };
};

// ✅ Get documents for a student
const getUserDocumentsFromDB = async (user: any, academicYear?: string) => {
  // 1️⃣ Get user categories
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      categories: {
        select: { id: true },
      },
    },
  });

  if (!dbUser) throw new Error('User not found');

  const categoryIds = dbUser.categories.map(c => c.id);

  // 2️⃣ Build where condition dynamically
  const whereCondition: any = {
    program: user.program,
    departmentId: user.departmentId,
    categoryId: { in: categoryIds },
  };

  // 3️⃣ Academic Year Filter (Optional)
  if (academicYear) {
    whereCondition.academicYear = academicYear;
  }

  // 4️⃣ Fetch Documents
  return prisma.document.findMany({
    where: whereCondition,
    include: {
      category: {
        select: { id: true, name: true },
      },
      uploadedBy: {
        select: { firstName: true, lastName: true },
      },
      department: {
        select: { id: true, name: true, program: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Alternative simpler version without assigned category filtering
// const getUserDocumentsFromDB = async (
//   user: {
//     id: string;
//     departmentId: string;
//     program: ProgramEnum;
//   },
//   academicYear?: string,
// ) => {
//   // 1️⃣ Build base filter
//   const whereCondition: any = {
//     departmentId: user.departmentId,
//     program: user.program,
//   };

//   // 2️⃣ Optional academic year filter
//   if (academicYear) {
//     whereCondition.academicYear = academicYear;
//   }

//   // 3️⃣ Fetch documents
//   return prisma.document.findMany({
//     where: whereCondition,
//     include: {
//       category: {
//         select: { id: true, name: true },
//       },
//       uploadedBy: {
//         select: { firstName: true, lastName: true },
//       },
//       department: {
//         select: { id: true, name: true, program: true },
//       },
//     },
//     orderBy: { createdAt: 'desc' },
//   });
// };

// ✅ Get documents for a student, optionally from a specific department

//to see any department document
const getUserDocumentsFromDBWithDept = async (
  user: { id: string; departmentId: string; program: ProgramEnum },
  academicYear?: string,
  targetDepartmentId?: string, // optional department
) => {
  // 1️⃣ Determine which department to fetch from
  const departmentToQuery = targetDepartmentId || user.departmentId;

  // 2️⃣ Build where condition
  const whereCondition: any = {};
  if(targetDepartmentId){
    whereCondition.departmentId = departmentToQuery
  }
  // if(user?.program){
  //   whereCondition.program = user?.program
  // }
  if(academicYear){
    whereCondition.academicYear = academicYear
  }

  // 4️⃣ Fetch documents
  return prisma.document.findMany({
    where: whereCondition,
    include: {
      category: {
        select: { id: true, name: true },
      },
      uploadedBy: {
        select: { firstName: true, lastName: true },
      },
      department: {
        select: { id: true, name: true, program: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const DocumentServices = {
  createDocumentIntoDB,
  getAllDocumentsFromDB,
  getDocumentByIdFromDB,
  updateDocumentIntoDB,
  deleteDocumentFromDB,
  getDocumentFilePath,
  getUserDocumentsFromDB,
  getUserDocumentsFromDBWithDept,
};
