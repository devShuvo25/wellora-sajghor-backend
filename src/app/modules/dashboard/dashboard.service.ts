import { OrderStatus, Role, UserStatus } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../../utils/prisma';

const getStatistics = async () => {
  /* ---------------- OVERVIEW ---------------- */
  const [
    totalUsers,
    totalCustomers,
    totalDistributors,
    totalProducts,
    totalCategories,
    totalOrders,
    deliveredOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.distributorProfile.count({ where: { user: { status: UserStatus.ACTIVE } } }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: OrderStatus.DELIVERED },
      select: { totalAmount: true },
    }),
  ]);

  const totalRevenue = deliveredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  /* ---------------- MONTHLY REVENUE & ORDERS (LAST 6 MONTHS) ---------------- */
  const last6Months = [...Array(6)]
    .map((_, i) => {
      const date = dayjs().subtract(i, 'month');
      return {
        start: date.startOf('month').toDate(),
        end: date.endOf('month').toDate(),
        label: date.format('MMM YYYY'),
      };
    })
    .reverse();

  const monthlySales = await Promise.all(
    last6Months.map(async (m) => {
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: m.start, lte: m.end },
          status: OrderStatus.DELIVERED,
        },
        select: { totalAmount: true },
      });

      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        month: m.label,
        ordersCount: orders.length,
        revenue: Number(revenue.toFixed(2)),
      };
    }),
  );

  return {
    overview: {
      totalUsers,
      totalCustomers,
      totalDistributors,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    },
    monthlySales,
  };
};

export const DashboardService = {
  getStatistics,
};
