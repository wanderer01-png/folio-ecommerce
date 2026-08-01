import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await fulfillOrder(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(checkoutSession: Stripe.Checkout.Session) {
  const existingOrder = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: checkoutSession.id },
  });
  if (existingOrder) return;

  const userId = checkoutSession.metadata?.userId;
  if (!userId) return;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { book: true } } },
  });
  if (!cart || cart.items.length === 0) return;

  const total = cart.items.reduce((sum, item) => {
    const unitPrice =
      item.format === "EBOOK" ? item.book.ebookPrice : item.book.hardcopyPrice;
    return sum + Number(unitPrice) * item.quantity;
  }, 0);

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : null;

  const hasShipping = Boolean(checkoutSession.metadata?.address);

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        userId,
        status: "PAID",
        total,
        shippingName: hasShipping ? checkoutSession.metadata?.name : null,
        shippingAddress: hasShipping ? checkoutSession.metadata?.address : null,
        shippingCity: hasShipping ? checkoutSession.metadata?.city : null,
        shippingState: hasShipping ? checkoutSession.metadata?.state : null,
        shippingZip: hasShipping ? checkoutSession.metadata?.zip : null,
        shippingCountry: hasShipping ? checkoutSession.metadata?.country : null,
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId: paymentIntentId,
        items: {
          create: cart.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            format: item.format,
            price:
              item.format === "EBOOK" ? item.book.ebookPrice! : item.book.hardcopyPrice!,
            title: item.book.title,
          })),
        },
      },
    });

    for (const item of cart.items) {
      if (item.format === "HARDCOPY") {
        await tx.book.update({
          where: { id: item.bookId },
          data: { hardcopyStock: { decrement: item.quantity } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });
}
