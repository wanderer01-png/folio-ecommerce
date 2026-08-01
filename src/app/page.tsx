import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const { products } = await getProducts({ page: 1 });

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16">
          <h1 className="text-4xl font-bold tracking-tight">
            Shop the latest arrivals
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Quality electronics, apparel, home goods, and books — all in one
            place.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/products" />}>
            Browse products
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold">Featured products</h2>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
