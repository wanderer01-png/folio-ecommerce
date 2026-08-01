import { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

export async function getDashboardStats() {
  const [revenueResult, orderCount, productCount, customerCount, recentOrders, lowStockProducts] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lt: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: "asc" },
        take: 5,
        select: { id: true, name: true, slug: true, stock: true },
      }),
    ]);

  return {
    totalRevenue: revenueResult._sum.total ?? 0,
    orderCount,
    productCount,
    customerCount,
    recentOrders,
    lowStockProducts,
  };
}

export interface AdminProductFilters {
  q?: string;
  page?: number;
}

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.ProductWhereInput = filters.q
    ? { name: { contains: filters.q, mode: "insensitive" as const } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
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
