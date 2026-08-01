import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function getUserOrders(userId: string, page = 1) {
  const currentPage = page > 0 ? page : 1;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: true },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    total,
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getUserOrderById(userId: string, orderId: string) {
  // Scoping by userId in the query itself (not just checking after fetch)
  // is what prevents one customer from viewing another's order by guessing an ID.
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}
