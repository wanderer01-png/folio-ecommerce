"use client";

import { BookOpen, Minus, Package, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { upsertCartItem } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import type { PurchaseFormat } from "@/generated/prisma/enums";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface BookPurchaseOptionsProps {
  book: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    ebookPrice: string | null;
    hardcopyPrice: string | null;
    hardcopyStock: number;
  };
}

export function BookPurchaseOptions({ book }: BookPurchaseOptionsProps) {
  const availableFormats: PurchaseFormat[] = [
    ...(book.ebookPrice ? (["EBOOK"] as const) : []),
    ...(book.hardcopyPrice ? (["HARDCOPY"] as const) : []),
  ];

  const [format, setFormat] = useState<PurchaseFormat | undefined>(
    availableFormats[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  if (availableFormats.length === 0 || !format) {
    return (
      <p className="text-muted-foreground text-sm">
        This title is currently unavailable.
      </p>
    );
  }

  const isHardcopyOutOfStock = format === "HARDCOPY" && book.hardcopyStock <= 0;
  const price = format === "EBOOK" ? book.ebookPrice! : book.hardcopyPrice!;

  const inCartQuantity =
    items.find((i) => i.bookId === book.id && i.format === format)?.quantity ?? 0;

  const handleAddToCart = async () => {
    setIsPending(true);

    addItem(
      {
        bookId: book.id,
        slug: book.slug,
        title: book.title,
        coverImage: book.coverImage,
        price,
        format,
        stock: book.hardcopyStock,
      },
      format === "EBOOK" ? 1 : quantity,
    );

    try {
      const newQuantity =
        format === "EBOOK" ? 1 : Math.min(inCartQuantity + quantity, book.hardcopyStock);
      await upsertCartItem(book.id, format, newQuantity);
      toast.success(
        `${book.title} (${format === "EBOOK" ? "e-book" : "hardcopy"}) added to cart`,
      );
    } catch {
      toast.error("Couldn't sync cart. Your item was still added locally.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {availableFormats.length > 1 && (
        <div className="grid grid-cols-2 gap-3">
          {availableFormats.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
                format === f
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {f === "EBOOK" ? (
                  <BookOpen className="size-4" />
                ) : (
                  <Package className="size-4" />
                )}
                {f === "EBOOK" ? "E-book" : "Hardcopy"}
              </span>
              <span className="text-lg font-semibold">
                {formatPrice(f === "EBOOK" ? book.ebookPrice! : book.hardcopyPrice!)}
              </span>
              <span className="text-muted-foreground text-xs">
                {f === "EBOOK" ? "Read instantly in your library" : "Ships to your address"}
              </span>
            </button>
          ))}
        </div>
      )}

      {format === "HARDCOPY" &&
        (isHardcopyOutOfStock ? (
          <p className="text-destructive text-sm font-medium">Out of stock</p>
        ) : (
          <p className="text-muted-foreground text-sm">{book.hardcopyStock} in stock</p>
        ))}

      <div className="flex items-center gap-3">
        {format === "HARDCOPY" && (
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
              onClick={() => setQuantity((q) => Math.min(book.hardcopyStock, q + 1))}
              disabled={quantity >= book.hardcopyStock}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        )}
        <Button size="lg" onClick={handleAddToCart} disabled={isPending || isHardcopyOutOfStock}>
          {isHardcopyOutOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
