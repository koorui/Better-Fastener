import { notFound } from "next/navigation";
import Link from "next/link";
import { getBaseUrl } from "@/lib/seo/metadata";
import { generateCategoryMetadata } from "@/lib/seo/metadata-generator";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

import { getCategoryBySlug } from "@/lib/db/queries";

async function getCategoryData(slug: string) {
  return getCategoryBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data?.category) return {};
  const c = data.category;
  return generateCategoryMetadata({
    name: c.name,
    nameEn: c.nameEn,
    slug: c.slug,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data?.category) notFound();

  const { category, products } = data;
  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen bg-zinc-50">
      <BreadcrumbJsonLd
        items={[
          { name: "首页", url: baseUrl },
          { name: "产品", url: `${baseUrl}/products` },
          { name: category.name, url: `${baseUrl}/products/category/${category.slug}` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-700">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-zinc-700">
            产品
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-zinc-900">{category.name}</h1>
        {category.nameEn && (
          <p className="mt-1 text-zinc-500">{category.nameEn}</p>
        )}

        {products.length === 0 ? (
          <p className="mt-8 text-zinc-500">该分类下暂无产品。</p>
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
    </div>
  );
}
