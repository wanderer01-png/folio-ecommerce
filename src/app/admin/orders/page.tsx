import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatus } from "@/generated/prisma/enums";
import { getAdminOrders } from "@/lib/admin";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders | Admin",
};

const STATUSES = Object.values(OrderStatus);

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const status =
    params.status && (params.status as OrderStatus) in OrderStatus
      ? (params.status as OrderStatus)
      : undefined;

  const { orders, totalPages } = await getAdminOrders({ status, page });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-md border px-3 py-1 text-sm",
            !status && "bg-accent font-medium",
          )}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              "rounded-md border px-3 py-1 text-sm",
              status === s && "bg-accent font-medium",
            )}
          >
            {s}
          </Link>
        ))}
      </nav>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                  {order.user.name ?? order.user.email}
                </Link>
              </TableCell>
              <TableCell>{formatPrice(order.total.toString())}</TableCell>
              <TableCell>
                <Badge variant="secondary">{order.status}</Badge>
              </TableCell>
              <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <p className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
