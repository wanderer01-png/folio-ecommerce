import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order confirmed | Folio",
};

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams;
  const session = await auth();

  if (!session_id || !session?.user) {
    redirect("/");
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  if (
    checkoutSession.payment_status !== "paid" ||
    checkoutSession.metadata?.userId !== session.user.id
  ) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <ClearCartOnSuccess />
      <CheckCircle2 className="text-primary size-12" />
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="text-muted-foreground">
        Thank you for your order. You can track its status from your account.
      </p>
      <Button nativeButton={false} render={<Link href="/products" />}>
        Continue shopping
      </Button>
    </div>
  );
}
