import express, { Router, Request, Response } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
// need to import below two to upload image -> upload is the middleware
// uploadImage is the function
import { upload } from '../middlewares/upload';
import { CategoryRoutes } from '../modules/category/category.routes';
import { PermissionRoutes } from '../modules/permission/permission.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { DocumentRoutes } from '../modules/document/document.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { DepartmentRoutes } from '../modules/department/department.routes';

const router: Router = express.Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/permissions',
    route: PermissionRoutes,
  },
  {
    path: '/documents',
    route: DocumentRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/departments',
    route: DepartmentRoutes,
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

// ROUTER TO UPLOAD IMAGE
/**
 * @method POST
 * @route {baseUrl}/upload
 * @select form-data in postman
 * @set key "image" and select image from your device
 */

export default router;
