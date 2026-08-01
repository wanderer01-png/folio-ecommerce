import type { Metadata } from "next";

import { createBook } from "@/app/admin/books/actions";
import { BookForm } from "@/components/admin/book-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Book | Admin",
};

export default async function NewBookPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">New book</h1>
      <BookForm action={createBook} genres={genres} submitLabel="Create book" />
    </div>
  );
}
