import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DeleteBookButton } from "@/components/admin/delete-book-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminBooks } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Books | Admin",
};

interface AdminBooksPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminBooksPage({ searchParams }: AdminBooksPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const { books, totalPages } = await getAdminBooks({ q: params.q, page });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Books</h1>
        <Button size="sm" nativeButton={false} render={<Link href="/admin/books/new" />}>
          <Plus className="size-4" />
          New book
        </Button>
      </div>

      <form action="/admin/books" method="GET" className="max-w-sm">
        <Input
          type="search"
          name="q"
          placeholder="Search by title or author..."
          defaultValue={params.q}
        />
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>E-book</TableHead>
            <TableHead>Hardcopy</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                No books found.
              </TableCell>
            </TableRow>
          )}
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.genre.name}</TableCell>
              <TableCell>
                {book.ebookPrice ? formatPrice(book.ebookPrice.toString()) : "—"}
              </TableCell>
              <TableCell>
                {book.hardcopyPrice
                  ? `${formatPrice(book.hardcopyPrice.toString())} (${book.hardcopyStock})`
                  : "—"}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${book.title}`}
                  nativeButton={false}
                  render={<Link href={`/admin/books/${book.id}/edit`} />}
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteBookButton bookId={book.id} bookTitle={book.title} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <p className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
