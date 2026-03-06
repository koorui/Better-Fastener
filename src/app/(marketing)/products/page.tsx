import Link from "next/link";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "产品中心",
  description: "Better Fasteners 产品目录 - 汽车紧固件、CNC零件、螺丝",
  path: "/products",
});

import { getProducts, getCategories } from "@/lib/db/queries";

async function loadProducts() {
  const [productsData, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return { products: productsData.products, categories };
}

export default async function ProductsPage() {
  const { products, categories } = await loadProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-900">产品中心</h1>

        {categories.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/products"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              全部
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/products/category/${c.slug}`}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {products.length === 0 ? (
          <p className="mt-8 text-zinc-500">暂无产品，请稍后再来。</p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/products/${p.slug}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {p.images && p.images[0] && (
                    <div className="relative mb-3 aspect-video overflow-hidden rounded bg-zinc-100">
                      <img
                        src={p.images![0]}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h2 className="font-semibold text-zinc-900">{p.name}</h2>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                      {p.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
