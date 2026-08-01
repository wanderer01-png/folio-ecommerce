"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type BookFormState = { error?: string } | undefined;

const optionalString = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const bookSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    author: z.string().min(1, "Author is required").max(200),
    isbn: z.preprocess(optionalString, z.string().optional()),
    description: z.string().min(1, "Description is required"),
    genreId: z.string().min(1, "Genre is required"),
    coverImages: z
      .string()
      .transform((value) =>
        value
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
      )
      .refine((urls) => urls.length > 0, "At least one cover image URL is required"),
    ebookPrice: z.preprocess(
      optionalString,
      z.coerce.number().positive("E-book price must be greater than 0").optional(),
    ),
    hardcopyPrice: z.preprocess(
      optionalString,
      z.coerce.number().positive("Hardcopy price must be greater than 0").optional(),
    ),
    hardcopyStock: z.coerce.number().int().min(0, "Stock cannot be negative"),
    ebookFileUrl: z.preprocess(optionalString, z.string().optional()),
    ebookFileType: z.preprocess(
      optionalString,
      z.enum(["PDF", "EPUB"]).optional(),
    ),
  })
  .refine((data) => data.ebookPrice !== undefined || data.hardcopyPrice !== undefined, {
    message: "At least one of e-book price or hardcopy price is required",
    path: ["ebookPrice"],
  })
  .refine(
    (data) => !data.ebookPrice || (data.ebookFileUrl && data.ebookFileType),
    {
      message: "An e-book file URL and file type are required when selling an e-book",
      path: ["ebookFileUrl"],
    },
  );

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let suffix = 1;

  while (
    await prisma.book.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createBook(
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = await uniqueSlug(parsed.data.title);

  await prisma.book.create({
    data: {
      title: parsed.data.title,
      slug,
      author: parsed.data.author,
      isbn: parsed.data.isbn,
      description: parsed.data.description,
      genreId: parsed.data.genreId,
      coverImages: parsed.data.coverImages,
      ebookPrice: parsed.data.ebookPrice,
      hardcopyPrice: parsed.data.hardcopyPrice,
      hardcopyStock: parsed.data.hardcopyStock,
      ebookFileUrl: parsed.data.ebookFileUrl,
      ebookFileType: parsed.data.ebookFileType,
    },
  });

  revalidatePath("/admin/books");
  revalidatePath("/books");
  redirect("/admin/books");
}

export async function updateBook(
  bookId: string,
  _prevState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existing) {
    return { error: "Book not found" };
  }

  const slug =
    existing.title === parsed.data.title
      ? existing.slug
      : await uniqueSlug(parsed.data.title, bookId);

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title: parsed.data.title,
      slug,
      author: parsed.data.author,
      isbn: parsed.data.isbn,
      description: parsed.data.description,
      genreId: parsed.data.genreId,
      coverImages: parsed.data.coverImages,
      ebookPrice: parsed.data.ebookPrice ?? null,
      hardcopyPrice: parsed.data.hardcopyPrice ?? null,
      hardcopyStock: parsed.data.hardcopyStock,
      ebookFileUrl: parsed.data.ebookFileUrl ?? null,
      ebookFileType: parsed.data.ebookFileType ?? null,
    },
  });

  revalidatePath("/admin/books");
  revalidatePath(`/books/${slug}`);
  revalidatePath("/books");
  redirect("/admin/books");
}

export async function deleteBook(
  bookId: string,
  _prevState: BookFormState,
): Promise<BookFormState> {
  await requireAdmin();

  try {
    await prisma.book.delete({ where: { id: bookId } });
  } catch {
    return {
      error:
        "This book can't be deleted because it has order history. Set its stock to 0 instead.",
    };
  }

  revalidatePath("/admin/books");
  revalidatePath("/books");
}
