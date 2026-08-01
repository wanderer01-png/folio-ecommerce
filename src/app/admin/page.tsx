import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard | Ecommerce",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatPrice(stats.totalRevenue.toString())}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.orderCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.productCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {stats.customerCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.recentOrders.length === 0 && (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            )}
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between text-sm hover:underline"
              >
                <span>{order.user.name ?? order.user.email}</span>
                <span className="flex items-center gap-2">
                  {formatPrice(order.total.toString())}
                  <Badge variant="secondary">{order.status}</Badge>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.lowStockProducts.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No products are low on stock.
              </p>
            )}
            {stats.lowStockProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center justify-between text-sm hover:underline"
              >
                <span>{product.name}</span>
                <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                  {product.stock} left
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
