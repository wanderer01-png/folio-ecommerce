import type { Metadata } from "next";

import { CategoryFilter } from "@/components/product/category-filter";
import { Pagination } from "@/components/product/pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchBar } from "@/components/product/search-bar";
import { getCategories, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products | Ecommerce",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const [{ products, totalPages }, categories] = await Promise.all([
    getProducts({ category: params.category, q: params.q, page }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <SearchBar defaultValue={params.q} activeCategory={params.category} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <aside>
          <CategoryFilter
            categories={categories}
            activeCategory={params.category}
            activeSearch={params.q}
          />
        </aside>

        <div>
          <ProductGrid products={products} />
          <Pagination
            page={page}
            totalPages={totalPages}
            category={params.category}
            q={params.q}
          />
        </div>
      </div>
    </div>
  );
}
