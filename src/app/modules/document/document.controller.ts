import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DocumentServices } from './document.service';
import { uploadDocument } from '../../utils/upload.file';
import { ProgramEnum } from '@prisma/client';

const uploadSingleDocument = uploadDocument.single('file');

// ✅ Upload a document
const createDocument = catchAsync(async (req: Request, res: Response) => {
  uploadSingleDocument(req, res, async (err: any) => {
    if (err) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: err.message,
        data: null,
      });
    }

    if (!req.file)
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        message: 'No file uploaded',
        data: null,
      });

    const payload = {
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      program: req.body.program,
      academicYear: req.body.academicYear,
      departmentId: req.body.departmentId,
      file: req.file,
    };

    const result = await DocumentServices.createDocumentIntoDB(
      payload,
      req.user!.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Document uploaded successfully',
      data: result,
    });
  });
});

// ✅ Get all documents with optional filters
const getAllDocuments = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    program: req.query.program as string,
    searchTerm: req.query.searchTerm as string,
    departmentId: req.query.departmentId as string,
    categoryId : req.query.categoryId as string,
    academicYear: req.query.academicYear as string,
  };

  const result = await DocumentServices.getAllDocumentsFromDB(
    req.user!.id,
    req.user!.role,
    filters,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Documents retrieved successfully',
    data: result,
  });
});

// ✅ Get document by ID
const getDocumentById = catchAsync(async (req: Request, res: Response) => {
  const result = await DocumentServices.getDocumentByIdFromDB(
    req.params.id,
    req.user!.id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Document retrieved successfully',
    data: result,
  });
});

// ✅ Update document
const updateDocument = catchAsync(async (req: Request, res: Response) => {
  const result = await DocumentServices.updateDocumentIntoDB(
    req.params.id,
    req.body,
    req.user!.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Document updated successfully',
    data: result,
  });
});

// ✅ Delete document
const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  const result = await DocumentServices.deleteDocumentFromDB(
    req.params.id,
    req.user!.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Document deleted successfully',
    data: result,
  });
});

// ✅ Download document
const downloadDocument = catchAsync(async (req: Request, res: Response) => {
  const filePath = await DocumentServices.getDocumentFilePath(
    req.params.id,
    req.user!.id,
    req.user!.role,
  );
  res.download(filePath, err => {
    if (err)
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error downloading file',
        data: null,
      });
  });
});

// ✅ Get documents for a student
const getUserDocuments = catchAsync(async (req, res) => {
  const academicYear = req.query.academicYear as string | undefined;

  const documents = await DocumentServices.getUserDocumentsFromDB(
    req.user,
    academicYear,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Documents retrieved successfully',
    data: documents,
  });
});

// ✅ Get documents for a student, optionally from another department
const getUserDocumentsFromDBWithDept = catchAsync(
  async (req: Request, res: Response) => {
    // Optional query params
    const academicYear = req.query.academicYear as string | undefined;
    const departmentId = req.query.departmentId as string | undefined; // optional department

    // req.user should have id, departmentId, program
    const documents = await DocumentServices.getUserDocumentsFromDBWithDept({
      ...req.user,
      program: req.user.program as ProgramEnum,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Documents retrieved successfully',
      data: documents,
    });
  },
);

export const DocumentController = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getUserDocuments,
  getUserDocumentsFromDBWithDept,
};
