import Link from "next/link";

import { BookGrid } from "@/components/book/book-grid";
import { Button } from "@/components/ui/button";
import { getBooks } from "@/lib/books";

export default async function HomePage() {
  const { books } = await getBooks({ page: 1 });

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16">
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            Read anywhere. Own it forever.
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Every title is available as an instant e-book or a hardcopy
            delivered to your door — sometimes both, always your choice.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/books" />}>
            Browse books
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-heading mb-6 text-2xl font-semibold">Featured books</h2>
        <BookGrid books={books} />
      </section>
    </div>
  );
}
