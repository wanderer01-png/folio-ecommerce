"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { book: true } } },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const hasHardcopyItem = cart.items.some((item) => item.format === "HARDCOPY");

  const hasInsufficientStock = cart.items.some(
    (item) => item.format === "HARDCOPY" && item.quantity > item.book.hardcopyStock,
  );
  if (hasInsufficientStock) {
    redirect("/cart?error=insufficient-stock");
  }

  const shipping = hasHardcopyItem
    ? {
        name: String(formData.get("name") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        zip: String(formData.get("zip") ?? ""),
        country: String(formData.get("country") ?? ""),
      }
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: cart.items.map((item) => {
      const unitPrice =
        item.format === "EBOOK" ? item.book.ebookPrice : item.book.hardcopyPrice;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.book.title} (${item.format === "EBOOK" ? "E-book" : "Hardcopy"})`,
            images: item.book.coverImages.slice(0, 1),
          },
          unit_amount: Math.round(Number(unitPrice) * 100),
        },
        quantity: item.quantity,
      };
    }),
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      userId: session.user.id,
      ...(shipping ?? {}),
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(checkoutSession.url);
}
