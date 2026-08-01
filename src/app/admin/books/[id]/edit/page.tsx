import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateBook } from "@/app/admin/books/actions";
import { BookForm } from "@/components/admin/book-form";
import { getAdminBookById } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Book | Admin",
};

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;

  const [book, genres] = await Promise.all([
    getAdminBookById(id),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!book) {
    notFound();
  }

  const updateWithId = updateBook.bind(null, book.id);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit book</h1>
      <BookForm
        action={updateWithId}
        genres={genres}
        submitLabel="Save changes"
        defaultValues={{
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          description: book.description,
          genreId: book.genreId,
          coverImages: book.coverImages,
          ebookPrice: book.ebookPrice?.toString() ?? null,
          hardcopyPrice: book.hardcopyPrice?.toString() ?? null,
          hardcopyStock: book.hardcopyStock,
          ebookFileUrl: book.ebookFileUrl,
          ebookFileType: book.ebookFileType,
        }}
      />
    </div>
  );
}
