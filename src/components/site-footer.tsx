import { BookMarked } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-heading flex items-center gap-2 font-semibold">
            <BookMarked className="size-5" />
            Folio
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm">
            Books in every format — read instantly or hold it in your hands.
          </p>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Shop</h3>
            <Link href="/books" className="text-muted-foreground text-sm hover:underline">
              Browse books
            </Link>
            <Link href="/library" className="text-muted-foreground text-sm hover:underline">
              Your library
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Account</h3>
            <Link
              href="/account/orders"
              className="text-muted-foreground text-sm hover:underline"
            >
              Order history
            </Link>
            <Link href="/login" className="text-muted-foreground text-sm hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-4 text-xs">
          © {new Date().getFullYear()} Folio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
