import type { Metadata } from "next";

import { createProduct } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New Product | Admin",
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">New product</h1>
      <ProductForm action={createProduct} categories={categories} submitLabel="Create product" />
    </div>
  );
}
