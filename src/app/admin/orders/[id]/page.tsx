import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Badge } from "@/components/ui/badge";
import { getAdminOrderById } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Detail | Admin",
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id.slice(-8)}</h1>
        <Badge variant="secondary">{order.status}</Badge>
      </div>

      <OrderStatusForm orderId={order.id} currentStatus={order.status} />

      <div>
        <h2 className="mb-2 font-medium">Customer</h2>
        <p className="text-sm">{order.user.name}</p>
        <p className="text-muted-foreground text-sm">{order.user.email}</p>
      </div>

      {order.shippingAddress && (
        <div>
          <h2 className="mb-2 font-medium">Shipping address</h2>
          <p className="text-sm">{order.shippingName}</p>
          <p className="text-sm">{order.shippingAddress}</p>
          <p className="text-sm">
            {order.shippingCity}, {order.shippingState} {order.shippingZip}
          </p>
          <p className="text-sm">{order.shippingCountry}</p>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-medium">Items</h2>
        <div className="flex flex-col divide-y rounded-md border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.format === "EBOOK" ? "E-book" : "Hardcopy"}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Qty {item.quantity}
                  </span>
                </div>
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
