import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  category?: string;
  q?: string;
}

export function Pagination({ page, totalPages, category, q }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    params.set("page", String(targetPage));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          page <= 1 && "pointer-events-none opacity-50",
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          page >= totalPages && "pointer-events-none opacity-50",
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
