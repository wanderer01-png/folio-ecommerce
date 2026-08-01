import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EpubViewer } from "@/components/library/epub-viewer";
import { PdfViewer } from "@/components/library/pdf-viewer";
import { auth } from "@/lib/auth";
import { userOwnsEbook } from "@/lib/library";
import { prisma } from "@/lib/prisma";

interface ReadBookPageProps {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({
  params,
}: ReadBookPageProps): Promise<Metadata> {
  const { bookId } = await params;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { title: true },
  });
  return { title: book ? `${book.title} | Folio` : "Read | Folio" };
}

export default async function ReadBookPage({ params }: ReadBookPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { bookId } = await params;

  // The entitlement check is the security boundary here — it's a dedicated,
  // userId-scoped query (see lib/library.ts), not something inferred from
  // the book lookup below.
  const owns = await userOwnsEbook(session.user.id, bookId);
  if (!owns) {
    notFound();
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || !book.ebookFileUrl || !book.ebookFileType) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-heading mb-4 text-xl font-semibold">{book.title}</h1>
      {book.ebookFileType === "PDF" ? (
        <PdfViewer url={book.ebookFileUrl} title={book.title} />
      ) : (
        <EpubViewer url={book.ebookFileUrl} title={book.title} />
      )}
    </div>
  );
}
