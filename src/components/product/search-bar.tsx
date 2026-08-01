import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchBar({
  defaultValue,
  activeCategory,
}: {
  defaultValue?: string;
  activeCategory?: string;
}) {
  return (
    <form action="/products" method="GET" className="relative w-full max-w-sm">
      {activeCategory && (
        <input type="hidden" name="category" value={activeCategory} />
      )}
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        name="q"
        placeholder="Search products..."
        defaultValue={defaultValue}
        className="pl-9"
      />
    </form>
  );
}
