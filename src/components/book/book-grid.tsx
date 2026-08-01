import type { getBooks } from "@/lib/books";

import { BookCard } from "./book-card";

type Book = Awaited<ReturnType<typeof getBooks>>["books"][number];

export function BookGrid({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        No books found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
