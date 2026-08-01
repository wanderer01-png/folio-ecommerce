import { prisma } from "@/lib/prisma";

// A user "owns" an e-book if they have an OrderItem for it with format EBOOK
// on an order that isn't PENDING or CANCELLED. There's no separate
// entitlements table — order history *is* the source of truth, which keeps
// this in sync with fulfillment automatically.
export async function getUserLibrary(userId: string) {
  const items = await prisma.orderItem.findMany({
    where: {
      format: "EBOOK",
      order: { userId, status: { notIn: ["PENDING", "CANCELLED"] } },
    },
    include: { book: true },
    distinct: ["bookId"],
    orderBy: { id: "desc" },
  });

  return items.map((item) => item.book);
}

// Scoping ownership by userId in the query itself (not checked after the
// fact) is what prevents someone from reading a book they haven't bought
// just by guessing its id in the URL.
export async function userOwnsEbook(userId: string, bookId: string) {
  const entitlement = await prisma.orderItem.findFirst({
    where: {
      bookId,
      format: "EBOOK",
      order: { userId, status: { notIn: ["PENDING", "CANCELLED"] } },
    },
  });

  return entitlement !== null;
}
