import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserLibrary } from "@/lib/library";

export const metadata: Metadata = {
  title: "Your Library | Folio",
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/library");
  }

  const books = await getUserLibrary(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading mb-6 text-2xl font-semibold">Your Library</h1>

      {books.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">
            You don&apos;t own any e-books yet.
          </p>
          <Button nativeButton={false} render={<Link href="/books" />}>
            Browse books
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/library/${book.id}/read`}
              className="group flex flex-col gap-2"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border">
                <Image
                  src={
                    book.coverImages[0] ??
                    "https://picsum.photos/seed/placeholder/500/750"
                  }
                  alt={book.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
              <div>
                <p className="line-clamp-1 font-medium">{book.title}</p>
                <p className="text-muted-foreground text-sm">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
