import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 8;

export interface BookFilters {
  genre?: string;
  q?: string;
  page?: number;
}

export async function getBooks(filters: BookFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.BookWhereInput = {
    ...(filters.genre ? { genre: { slug: filters.genre } } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { author: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

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

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({
    where: { slug },
    include: { genre: true },
  });
}

export async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}
