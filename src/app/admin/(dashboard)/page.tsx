import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">管理后台概览</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h3 className="font-semibold text-zinc-900">商品管理</h3>
          <p className="mt-1 text-sm text-zinc-500">增删改查商品</p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h3 className="font-semibold text-zinc-900">站点设置</h3>
          <p className="mt-1 text-sm text-zinc-500">联系方式等</p>
        </Link>
        <Link
          href="/admin/forms"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h3 className="font-semibold text-zinc-900">表单记录</h3>
          <p className="mt-1 text-sm text-zinc-500">查看询盘表单</p>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow"
        >
          <h3 className="font-semibold text-zinc-900">访问前台</h3>
          <p className="mt-1 text-sm text-zinc-500">打开网站首页</p>
        </Link>
      </div>
    </div>
  );
}
