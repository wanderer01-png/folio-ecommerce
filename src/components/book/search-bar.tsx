import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function SearchBar({
  defaultValue,
  activeGenre,
}: {
  defaultValue?: string;
  activeGenre?: string;
}) {
  return (
    <form action="/books" method="GET" className="relative w-full max-w-sm">
      {activeGenre && <input type="hidden" name="genre" value={activeGenre} />}
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        name="q"
        placeholder="Search by title or author..."
        defaultValue={defaultValue}
        className="pl-9"
      />
    </form>
  );
}
