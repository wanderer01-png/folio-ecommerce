import Link from "next/link";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory?: string;
  activeSearch?: string;
}

export function CategoryFilter({
  categories,
  activeCategory,
  activeSearch,
}: CategoryFilterProps) {
  const buildHref = (categorySlug?: string) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (activeSearch) params.set("q", activeSearch);
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  };

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href={buildHref()}
        className={cn(
          "rounded-md px-3 py-2 text-sm hover:bg-accent",
          !activeCategory && "bg-accent font-medium",
        )}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildHref(category.slug)}
          className={cn(
            "rounded-md px-3 py-2 text-sm hover:bg-accent",
            activeCategory === category.slug && "bg-accent font-medium",
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
