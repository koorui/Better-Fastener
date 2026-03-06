import Link from "next/link";
import { searchProducts } from "@/lib/db/queries";

export async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q || q.trim().length < 2) {
    return (
      <p className="mt-6 text-zinc-500">
        输入至少 2 个字符进行搜索。
      </p>
    );
  }

  const products = await searchProducts(q);

  if (products.length === 0) {
    return (
      <p className="mt-6 text-zinc-500">
        未找到与「{q}」相关的产品。
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-zinc-500">
        找到 {products.length} 个相关产品
      </p>
      <ul className="space-y-4">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.slug}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:shadow-md"
            >
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
    </div>
  );
}
