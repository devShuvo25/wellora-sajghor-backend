import { UserRoleEnum, UserStatus } from "@prisma/client";
import dayjs from "dayjs";
import prisma from "../../utils/prisma";

const getStatistics = async () => {
  /* ---------------- OVERVIEW ---------------- */
  const [
    totalUsers,
    totalAdmins,
    totalDocuments,
    totalCategories,
    activeUsers,
    blockedUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { role: { in: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN] } },
    }),
    prisma.document.count(),
    prisma.category.count(),
    prisma.user.count({ where: { status: UserStatus.ACTIVATE } }),
    prisma.user.count({ where: { status: UserStatus.BLOCKED } }),
  ]);

  /* ---------------- MONTHLY STATS ---------------- */
  const last6Months = [...Array(6)].map((_, i) => {
    const date = dayjs().subtract(i, "month");
    return {
      start: date.startOf("month").toDate(),
      end: date.endOf("month").toDate(),
      label: date.format("MMM"),
    };
  }).reverse();

  const monthlyStats = await Promise.all(
    last6Months.map(async (m) => {
      const users = await prisma.user.count({
        where: {
          createdAt: { gte: m.start, lte: m.end },
        },
      });

      const documents = await prisma.document.count({
        where: {
          createdAt: { gte: m.start, lte: m.end },
        },
      });

      return {
        month: m.label,
        users,
        documents,
      };
    })
  );

  /* ---------------- USER GROWTH (LAST 30 DAYS) ---------------- */
  const last30Days = [...Array(30)].map((_, i) =>
    dayjs().subtract(i, "day").format("YYYY-MM-DD")
  ).reverse();

  const userGrowth = await Promise.all(
    last30Days.map(async (date) => {
      const start = dayjs(date).startOf("day").toDate();
      const end = dayjs(date).endOf("day").toDate();

      const count = await prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      });

      return { date, count };
    })
  );

  /* ---------------- DOCUMENTS BY CATEGORY ---------------- */
  const documentsByCategory = await prisma.category.findMany({
    select: {
      name: true,
      _count: {
        select: {
          documents: true,
        },
      },
    },
  });

  return {
    overview: {
      users: totalUsers,
      admins: totalAdmins,
      documents: totalDocuments,
      categories: totalCategories,
      activeUsers,
      blockedUsers,
    },
    monthlyStats,
    userGrowth,
    documentsByCategory: documentsByCategory.map((c) => ({
      category: c.name,
      documents: c._count.documents,
    })),
  };
};

export const DashboardService = {
  getStatistics,
};
