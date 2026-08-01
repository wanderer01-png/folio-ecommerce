import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartIndicator } from "@/components/cart/cart-indicator";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" />
          Ecommerce
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm hover:underline">
            Products
          </Link>

          <CartIndicator />

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
