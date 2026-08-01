"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useCartStore } from "@/store/cart-store";

export function CartIndicator() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <Link href="/cart" className="relative flex items-center" aria-label="Cart">
      <ShoppingCart className="size-5" />
      {itemCount > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full text-[10px]">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
