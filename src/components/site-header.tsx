import { BookMarked } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartIndicator } from "@/components/cart/cart-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-heading flex items-center gap-2 font-semibold">
          <BookMarked className="size-5" />
          Folio
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/books" className="text-sm hover:underline">
            Books
          </Link>

          <CartIndicator />
          <ThemeToggle />

          {session?.user ? (
            <>
              <Link href="/library" className="text-sm hover:underline">
                Library
              </Link>
              <Link href="/account/orders" className="text-sm hover:underline">
                Orders
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
              <SignOutButton />
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
