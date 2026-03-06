"use client";

import { useState, useEffect } from "react";

const FORMAT_DATE = (d: string | null) =>
  d ? new Date(d).toLocaleString("zh-CN") : "-";

export default function FormsPage() {
  const [data, setData] = useState<{ submissions: unknown[]; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/forms")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-zinc-500">加载中...</p>;

  const { submissions, total } = data;
  const rows = submissions as Array<{
    id: string;
    formType: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    message: string | null;
    utmSource: string | null;
    referrer: string | null;
    landingPage: string | null;
    createdAt: string | null;
  }>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">表单记录</h1>
      <p className="mt-1 text-sm text-zinc-500">共 {total} 条记录</p>
      {rows.length === 0 ? (
        <p className="mt-8 text-zinc-500">暂无表单提交</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse border border-zinc-200">
            <thead>
              <tr className="bg-zinc-50">
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  类型
                </th>
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  姓名
                </th>
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  邮箱
                </th>
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  电话
                </th>
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  来源
                </th>
                <th className="border border-zinc-200 px-4 py-2 text-left text-sm font-medium">
                  提交时间
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {r.formType}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {r.name ?? "-"}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {r.email ?? "-"}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {r.phone ?? "-"}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {r.utmSource || r.referrer || "-"}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2 text-sm">
                    {FORMAT_DATE(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
