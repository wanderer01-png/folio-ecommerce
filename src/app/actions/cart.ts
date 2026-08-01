"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/store/cart-store";

export interface GuestCartItem {
  productId: string;
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
    include: { items: { include: { product: true } } },
  });
}

function toStoreItems(
  cart: Awaited<ReturnType<typeof fetchFullCart>>,
): CartItem[] {
  if (!cart) return [];

  return cart.items.map((item) => ({
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    image: item.product.images[0] ?? "",
    price: item.product.price.toString(),
    stock: item.product.stock,
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
  productId: string,
  quantity: number,
): Promise<CartItem[] | null> {
  const session = await auth();
  if (!session?.user) return null;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const clampedQuantity = Math.max(0, Math.min(quantity, product.stock));
  const cart = await getOrCreateCart(session.user.id);

  if (clampedQuantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: clampedQuantity },
      create: { cartId: cart.id, productId, quantity: clampedQuantity },
    });
  }

  return getServerCart();
}

export async function removeCartItem(
  productId: string,
): Promise<CartItem[] | null> {
  const session = await auth();
  if (!session?.user) return null;

  const cart = await getOrCreateCart(session.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

  return getServerCart();
}

export async function mergeGuestCart(
  guestItems: GuestCartItem[],
): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];

  if (guestItems.length === 0) {
    return getServerCart();
  }

  const cart = await getOrCreateCart(session.user.id);

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestItems) {
      const product = await tx.product.findUnique({
        where: { id: guestItem.productId },
      });
      if (!product) continue;

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: cart.id, productId: guestItem.productId },
        },
      });

      const newQuantity = Math.min(
        (existing?.quantity ?? 0) + guestItem.quantity,
        product.stock,
      );

      await tx.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: guestItem.productId },
        },
        update: { quantity: newQuantity },
        create: {
          cartId: cart.id,
          productId: guestItem.productId,
          quantity: newQuantity,
        },
      });
    }
  });

  return getServerCart();
}
