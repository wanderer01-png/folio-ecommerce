"use server";

import type { PurchaseFormat } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/store/cart-store";

export interface GuestCartItem {
  bookId: string;
  format: PurchaseFormat;
  quantity: number;
}

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function fetchFullCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { book: true } } },
  });
}

function priceForFormat(
  book: { ebookPrice: unknown; hardcopyPrice: unknown },
  format: PurchaseFormat,
) {
  const price = format === "EBOOK" ? book.ebookPrice : book.hardcopyPrice;
  return price ? price.toString() : "0";
}

function toStoreItems(
  cart: Awaited<ReturnType<typeof fetchFullCart>>,
): CartItem[] {
  if (!cart) return [];

  return cart.items.map((item) => ({
    bookId: item.bookId,
    slug: item.book.slug,
    title: item.book.title,
    coverImage: item.book.coverImages[0] ?? "",
    price: priceForFormat(item.book, item.format),
    format: item.format,
    stock: item.book.hardcopyStock,
    quantity: item.quantity,
  }));
}

export async function getServerCart(): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];

  const cart = await fetchFullCart(session.user.id);
  return toStoreItems(cart);
}

export async function upsertCartItem(
  bookId: string,
  format: PurchaseFormat,
  quantity: number,
): Promise<CartItem[] | null> {
  const session = await auth();
  if (!session?.user) return null;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found");

  const clampedQuantity =
    format === "EBOOK"
      ? quantity > 0
        ? 1
        : 0
      : Math.max(0, Math.min(quantity, book.hardcopyStock));

  const cart = await getOrCreateCart(session.user.id);

  if (clampedQuantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, bookId, format } });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_bookId_format: { cartId: cart.id, bookId, format } },
      update: { quantity: clampedQuantity },
      create: { cartId: cart.id, bookId, format, quantity: clampedQuantity },
    });
  }

  return getServerCart();
}

export async function removeCartItem(
  bookId: string,
  format: PurchaseFormat,
): Promise<CartItem[] | null> {
  const session = await auth();
  if (!session?.user) return null;

  const cart = await getOrCreateCart(session.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, bookId, format } });

  return getServerCart();
}

export async function mergeGuestCart(
  guestItems: GuestCartItem[],
): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user || guestItems.length === 0) {
    return getServerCart();
  }

  const cart = await getOrCreateCart(session.user.id);

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestItems) {
      const book = await tx.book.findUnique({ where: { id: guestItem.bookId } });
      if (!book) continue;

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_bookId_format: {
            cartId: cart.id,
            bookId: guestItem.bookId,
            format: guestItem.format,
          },
        },
      });

      const requestedQuantity = (existing?.quantity ?? 0) + guestItem.quantity;
      const newQuantity =
        guestItem.format === "EBOOK"
          ? 1
          : Math.min(requestedQuantity, book.hardcopyStock);

      await tx.cartItem.upsert({
        where: {
          cartId_bookId_format: {
            cartId: cart.id,
            bookId: guestItem.bookId,
            format: guestItem.format,
          },
        },
        update: { quantity: newQuantity },
        create: {
          cartId: cart.id,
          bookId: guestItem.bookId,
          format: guestItem.format,
          quantity: newQuantity,
        },
      });
    }
  });

  return getServerCart();
}
