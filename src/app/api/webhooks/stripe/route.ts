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
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) return;

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : null;

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        userId,
        status: "PAID",
        total,
        shippingName: checkoutSession.metadata?.name ?? "",
        shippingAddress: checkoutSession.metadata?.address ?? "",
        shippingCity: checkoutSession.metadata?.city ?? "",
        shippingState: checkoutSession.metadata?.state ?? "",
        shippingZip: checkoutSession.metadata?.zip ?? "",
        shippingCountry: checkoutSession.metadata?.country ?? "",
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId: paymentIntentId,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
          })),
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });
}
