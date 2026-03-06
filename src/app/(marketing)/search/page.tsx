import { Suspense } from "react";
import Link from "next/link";
import { SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "商品搜索",
  description: "搜索 Better Fasteners 紧固件产品",
  path: "/search",
  noIndex: true,
});

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-900">商品搜索</h1>
        <Suspense fallback={<div className="mt-6 h-10" />}>
          <SearchForm />
        </Suspense>
        <Suspense fallback={<p className="mt-6 text-zinc-500">搜索中...</p>}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
