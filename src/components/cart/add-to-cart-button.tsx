"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { upsertCartItem } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

interface AddToCartButtonProps {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: string;
    stock: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  if (product.stock <= 0) {
    return (
      <Button size="lg" disabled className="w-fit">
        Out of stock
      </Button>
    );
  }

  const inCartQuantity =
    items.find((i) => i.productId === product.id)?.quantity ?? 0;

  const handleAddToCart = async () => {
    setIsPending(true);

    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
      },
      quantity,
    );

    try {
      const newQuantity = Math.min(inCartQuantity + quantity, product.stock);
      await upsertCartItem(product.id, newQuantity);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Couldn't sync cart. Your item was still added locally.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-8 text-center text-sm">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          disabled={quantity >= product.stock}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button size="lg" onClick={handleAddToCart} disabled={isPending}>
        Add to cart
      </Button>
    </div>
  );
}
