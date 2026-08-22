import express from 'express';
import { DocumentController } from './document.controller';
import auth from '../../middlewares/auth';
// Add auth middleware later

const router = express.Router();

router.post(
  '/',
  auth('SUPERADMIN', 'ADMIN'),
  DocumentController.createDocument,
);
router.get(
  '/',
  auth('SUPERADMIN', 'ADMIN', 'USER'),
  DocumentController.getAllDocuments,
);

router.get('/my-documents', auth('USER'), DocumentController.getUserDocuments);

router.get(
  '/:id',
  auth('SUPERADMIN', 'ADMIN'),
  DocumentController.getDocumentById,
);
router.get(
  '/:id/download',
  auth('SUPERADMIN', 'ADMIN', 'USER'),
  DocumentController.downloadDocument,
);
router.patch(
  '/:id',
  auth('SUPERADMIN', 'ADMIN'),
  DocumentController.updateDocument,
);
router.delete(
  '/:id',
  auth('SUPERADMIN', 'ADMIN'),
  DocumentController.deleteDocument,
);

export const DocumentRoutes = router;
