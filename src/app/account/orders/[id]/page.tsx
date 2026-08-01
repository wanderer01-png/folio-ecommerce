import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OrderTracker } from "@/components/account/order-tracker";
import { auth } from "@/lib/auth";
import { getUserOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Detail | Ecommerce",
};

interface AccountOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await getUserOrderById(session.user.id, id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Order #{order.id.slice(-8)}</h1>

      <div className="mb-8">
        <OrderTracker status={order.status} />
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-medium">Shipping address</h2>
        <p className="text-sm">{order.shippingName}</p>
        <p className="text-sm">{order.shippingAddress}</p>
        <p className="text-sm">
          {order.shippingCity}, {order.shippingState} {order.shippingZip}
        </p>
        <p className="text-sm">{order.shippingCountry}</p>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Items</h2>
        <div className="flex flex-col divide-y rounded-md border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-muted-foreground text-sm">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total.toString())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
