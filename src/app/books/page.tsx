import type { Metadata } from "next";

import { BookGrid } from "@/components/book/book-grid";
import { GenreFilter } from "@/components/book/genre-filter";
import { Pagination } from "@/components/book/pagination";
import { SearchBar } from "@/components/book/search-bar";
import { getBooks, getGenres } from "@/lib/books";

export const metadata: Metadata = {
  title: "Browse Books | Folio",
};

interface BooksPageProps {
  searchParams: Promise<{
    genre?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const [{ books, totalPages }, genres] = await Promise.all([
    getBooks({ genre: params.genre, q: params.q, page }),
    getGenres(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold">Browse Books</h1>
        <SearchBar defaultValue={params.q} activeGenre={params.genre} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <aside>
          <GenreFilter
            genres={genres}
            activeGenre={params.genre}
            activeSearch={params.q}
          />
        </aside>

        <div>
          <BookGrid books={books} />
          <Pagination
            page={page}
            totalPages={totalPages}
            genre={params.genre}
            q={params.q}
          />
        </div>
      </div>
    </div>
  );
}
