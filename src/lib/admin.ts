import { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

export async function getDashboardStats() {
  const [revenueResult, orderCount, bookCount, customerCount, recentOrders, lowStockBooks] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.book.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.book.findMany({
        where: {
          hardcopyPrice: { not: null },
          hardcopyStock: { lt: LOW_STOCK_THRESHOLD },
        },
        orderBy: { hardcopyStock: "asc" },
        take: 5,
        select: { id: true, title: true, slug: true, hardcopyStock: true },
      }),
    ]);

  return {
    totalRevenue: revenueResult._sum.total ?? 0,
    orderCount,
    bookCount,
    customerCount,
    recentOrders,
    lowStockBooks,
  };
}

export interface AdminBookFilters {
  q?: string;
  page?: number;
}

export async function getAdminBooks(filters: AdminBookFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.BookWhereInput = filters.q
    ? {
        OR: [
          { title: { contains: filters.q, mode: "insensitive" as const } },
          { author: { contains: filters.q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { genre: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminBookById(id: string) {
  return prisma.book.findUnique({ where: { id } });
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  page?: number;
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.OrderWhereInput = filters.status
    ? { status: filters.status }
    : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });
}
