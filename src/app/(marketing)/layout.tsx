import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-semibold text-zinc-900">
            Better Fasteners
          </Link>
          <nav className="flex gap-6">
            <Link href="/products" className="text-zinc-600 hover:text-zinc-900">
              产品
            </Link>
            <Link href="/search" className="text-zinc-600 hover:text-zinc-900">
              搜索
            </Link>
            <Link href="/contact" className="text-zinc-600 hover:text-zinc-900">
              联系我们
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Better Fasteners Co., Ltd. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
