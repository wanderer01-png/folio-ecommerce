import type { getProducts } from "@/lib/products";

import { ProductCard } from "./product-card";

type Product = Awaited<ReturnType<typeof getProducts>>["products"][number];

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
