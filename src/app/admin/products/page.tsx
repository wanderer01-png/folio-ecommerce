import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
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
import { getAdminProducts } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products | Admin",
};

interface AdminProductsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const { products, totalPages } = await getAdminProducts({ q: params.q, page });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button size="sm" nativeButton={false} render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" />
          New product
        </Button>
      </div>

      <form action="/admin/products" method="GET" className="max-w-sm">
        <Input
          type="search"
          name="q"
          placeholder="Search products..."
          defaultValue={params.q}
        />
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No products found.
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{formatPrice(product.price.toString())}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${product.name}`}
                  nativeButton={false}
                  render={<Link href={`/admin/products/${product.id}/edit`} />}
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteProductButton productId={product.id} productName={product.name} />
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
