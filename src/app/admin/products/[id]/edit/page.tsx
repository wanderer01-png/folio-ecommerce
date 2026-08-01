import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateProduct } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProductById } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Product | Admin",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        action={updateWithId}
        categories={categories}
        submitLabel="Save changes"
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock,
          categoryId: product.categoryId,
          images: product.images,
        }}
      />
    </div>
  );
}
