import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BookPurchaseOptions } from "@/components/cart/book-purchase-options";
import { Badge } from "@/components/ui/badge";
import { getBookBySlug } from "@/lib/books";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return { title: "Book not found | Folio" };
  }

  return {
    title: `${book.title} | Folio`,
    description: book.description,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border">
          <Image
            src={book.coverImages[0] ?? "https://picsum.photos/seed/placeholder/500/750"}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            {book.genre.name}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold">{book.title}</h1>
          <p className="text-muted-foreground">by {book.author}</p>
          <p className="text-muted-foreground">{book.description}</p>

          <BookPurchaseOptions
            book={{
              id: book.id,
              slug: book.slug,
              title: book.title,
              coverImage:
                book.coverImages[0] ?? "https://picsum.photos/seed/placeholder/500/750",
              ebookPrice: book.ebookPrice?.toString() ?? null,
              hardcopyPrice: book.hardcopyPrice?.toString() ?? null,
              hardcopyStock: book.hardcopyStock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
