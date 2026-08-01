import Link from "next/link";

import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: { id: string; name: string; slug: string }[];
  activeGenre?: string;
  activeSearch?: string;
}

export function GenreFilter({ genres, activeGenre, activeSearch }: GenreFilterProps) {
  const buildHref = (genreSlug?: string) => {
    const params = new URLSearchParams();
    if (genreSlug) params.set("genre", genreSlug);
    if (activeSearch) params.set("q", activeSearch);
    const query = params.toString();
    return query ? `/books?${query}` : "/books";
  };

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href={buildHref()}
        className={cn(
          "rounded-md px-3 py-2 text-sm hover:bg-accent",
          !activeGenre && "bg-accent font-medium",
        )}
      >
        All Books
      </Link>
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={buildHref(genre.slug)}
          className={cn(
            "rounded-md px-3 py-2 text-sm hover:bg-accent",
            activeGenre === genre.slug && "bg-accent font-medium",
          )}
        >
          {genre.name}
        </Link>
      ))}
    </nav>
  );
}
