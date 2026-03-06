import { notFound } from "next/navigation";
import Link from "next/link";
import { getBaseUrl } from "@/lib/seo/metadata";
import { generateProductMetadata } from "@/lib/seo/metadata-generator";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

import { getProductBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return getProductBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data?.product) return {};
  const p = data.product;
  return generateProductMetadata({
    name: p.name,
    nameEn: p.nameEn,
    description: p.description,
    seoTitle: p.seoTitle,
    seoDesc: p.seoDesc,
    slug: p.slug,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data?.product) notFound();

  const p = data.product;
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/products/${p.slug}`;

  return (
    <>
      <ProductJsonLd
        name={p.name}
        description={p.description || p.seoDesc || undefined}
        image={p.images?.[0]}
        url={productUrl}
        sku={p.id}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "首页", url: baseUrl },
          { name: "产品", url: `${baseUrl}/products` },
          { name: p.name, url: productUrl },
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
          <span className="text-zinc-900">{p.name}</span>
        </nav>

        <article className="rounded-lg border border-zinc-200 bg-white p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {p.images?.length ? (
              <div className="space-y-2">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full rounded-lg object-cover"
                />
                {p.images.length > 1 && (
                  <div className="flex gap-2">
                    {p.images.slice(1, 4).map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${p.name} - ${i + 2}`}
                        className="h-20 w-20 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
                暂无图片
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{p.name}</h1>
              {p.nameEn && (
                <p className="mt-1 text-zinc-500">{p.nameEn}</p>
              )}
              {p.description && (
                <div className="mt-6 text-zinc-600">
                  <h2 className="mb-2 font-semibold text-zinc-900">产品描述</h2>
                  <p className="whitespace-pre-wrap">{p.description}</p>
                </div>
              )}
              {p.specs && Object.keys(p.specs).length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-semibold text-zinc-900">规格参数</h2>
                  <dl className="space-y-1">
                    {Object.entries(p.specs).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="text-zinc-500">{k}:</dt>
                        <dd className="text-zinc-700">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-block rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800"
                >
                  询价 / 联系我们
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
