import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { getBooks } from "@/lib/books";
import { formatPrice } from "@/lib/utils";

type Book = Awaited<ReturnType<typeof getBooks>>["books"][number];

export function BookCard({ book }: { book: Book }) {
  const prices = [book.ebookPrice, book.hardcopyPrice].filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );
  const lowestPrice = prices.length
    ? prices.reduce((min, p) => (Number(p) < Number(min) ? p : min))
    : null;
  const showsFromPrice = prices.length > 1;

  return (
    <Link href={`/books/${book.slug}`}>
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardHeader className="relative aspect-[2/3] p-0">
          <Image
            src={book.coverImages[0] ?? "https://picsum.photos/seed/placeholder/500/750"}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </CardHeader>
        <CardContent className="pt-4">
          <Badge variant="secondary" className="mb-2">
            {book.genre.name}
          </Badge>
          <h3 className="line-clamp-1 font-medium">{book.title}</h3>
          <p className="text-muted-foreground text-sm">{book.author}</p>
        </CardContent>
        <CardFooter className="pb-4">
          {lowestPrice ? (
            <span className="font-semibold">
              {showsFromPrice && "From "}
              {formatPrice(lowestPrice.toString())}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">Unavailable</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
