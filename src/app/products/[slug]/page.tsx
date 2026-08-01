import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Ecommerce" };
  }

  return {
    title: `${product.name} | Ecommerce`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={
              product.images[0] ??
              "https://picsum.photos/seed/placeholder/600/600"
            }
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            {product.category.name}
          </Badge>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-2xl font-bold">
            {formatPrice(product.price.toString())}
          </p>
          <p className="text-muted-foreground">{product.description}</p>

          {isOutOfStock ? (
            <Badge variant="destructive" className="w-fit">
              Out of stock
            </Badge>
          ) : (
            <p className="text-muted-foreground text-sm">
              {product.stock} in stock
            </p>
          )}

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              image:
                product.images[0] ??
                "https://picsum.photos/seed/placeholder/600/600",
              price: product.price.toString(),
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
