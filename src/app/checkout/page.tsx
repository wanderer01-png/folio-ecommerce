import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout | Ecommerce",
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>

      <div className="mb-8 flex flex-col divide-y rounded-md border">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-muted-foreground text-sm">Qty {item.quantity}</p>
            </div>
            <p className="font-medium">
              {formatPrice(Number(item.product.price) * item.quantity)}
            </p>
          </div>
        ))}
        <div className="flex items-center justify-between p-4 font-semibold">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </div>

      <form action={createCheckoutSession} className="flex flex-col gap-4">
        <h2 className="font-medium">Shipping details</h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={session.user.name ?? ""}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zip">ZIP code</Label>
            <Input id="zip" name="zip" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required defaultValue="US" />
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-2">
          Continue to payment
        </Button>
      </form>
    </div>
  );
}
