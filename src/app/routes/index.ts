import express, { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { OrderRoutes } from '../modules/order/order.routes';
import { DistributorRoutes } from '../modules/distributor/distributor.routes';
import { WishlistRoutes } from '../modules/wishlist/wishlist.routes';
import { LoyaltyRoutes } from '../modules/loyalty/loyalty.routes';
import { MarketingKitRoutes } from '../modules/marketingKit/marketingKit.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';

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
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/distributors',
    route: DistributorRoutes,
  },
  {
    path: '/wishlist',
    route: WishlistRoutes,
  },
  {
    path: '/loyalty',
    route: LoyaltyRoutes,
  },
  {
    path: '/marketing-kits',
    route: MarketingKitRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
