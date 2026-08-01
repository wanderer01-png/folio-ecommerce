import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { getProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

type Product = Awaited<ReturnType<typeof getProducts>>["products"][number];

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardHeader className="relative aspect-square p-0">
          <Image
            src={product.images[0] ?? "https://picsum.photos/seed/placeholder/600/600"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of stock
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <Badge variant="secondary" className="mb-2">
            {product.category.name}
          </Badge>
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        </CardContent>
        <CardFooter className="pb-4">
          <span className="font-semibold">{formatPrice(product.price.toString())}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
