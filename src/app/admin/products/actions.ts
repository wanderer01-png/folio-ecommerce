"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type ProductFormState = { error?: string } | undefined;

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
    )
    .refine((urls) => urls.length > 0, "At least one image URL is required"),
});

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }
}

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;

  while (
    await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = await uniqueSlug(parsed.data.name);

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      categoryId: parsed.data.categoryId,
      images: parsed.data.images,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return { error: "Product not found" };
  }

  const slug =
    existing.name === parsed.data.name
      ? existing.slug
      : await uniqueSlug(parsed.data.name, productId);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      categoryId: parsed.data.categoryId,
      images: parsed.data.images,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(
  productId: string,
  _prevState: ProductFormState,
): Promise<ProductFormState> {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch {
    return {
      error:
        "This product can't be deleted because it has order history. Set its stock to 0 instead.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
}
