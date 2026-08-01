"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { removeCartItem, upsertCartItem } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
    void upsertCartItem(productId, quantity);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    void removeCartItem(productId);
  };

  const handleClear = () => {
    const productIds = items.map((item) => item.productId);
    clearCart();
    productIds.forEach((productId) => void removeCartItem(productId));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button nativeButton={false} render={<Link href="/products" />}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            <div className="flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-muted-foreground text-sm">
                {formatPrice(item.price)}
              </p>
            </div>

            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() =>
                  handleQuantityChange(item.productId, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() =>
                  handleQuantityChange(item.productId, item.quantity + 1)
                }
                disabled={item.quantity >= item.stock}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <span className="w-20 text-right font-medium">
              {formatPrice(Number(item.price) * item.quantity)}
            </span>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove item"
              onClick={() => handleRemove(item.productId)}
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear cart
        </Button>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">Subtotal</p>
          <p className="text-xl font-semibold">{formatPrice(subtotal)}</p>
        </div>
      </div>
    </div>
  );
}
