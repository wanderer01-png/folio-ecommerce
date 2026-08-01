import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your Orders | Folio",
};

interface AccountOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AccountOrdersPage({
  searchParams,
}: AccountOrdersPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const { orders, totalPages } = await getUserOrders(session.user.id, page);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Your orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Button nativeButton={false} render={<Link href="/books" />}>
            Browse books
          </Button>
        </div>
      ) : (
        <div className="flex flex-col divide-y rounded-md border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="hover:bg-accent flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                <p className="text-muted-foreground text-sm">
                  {order.createdAt.toLocaleDateString()} · {order.items.length}{" "}
                  item(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {formatPrice(order.total.toString())}
                </span>
                <Badge variant="secondary">{order.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <p className="text-muted-foreground mt-4 text-sm">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
