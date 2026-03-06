"use client";

import { useEffect, useState } from "react";

type ApiKeyRow = {
  id: string;
  name: string | null;
  permissions: string[] | null;
  createdAt: string | null;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/api-keys")
      .then((r) => r.json())
      .then((data) => {
        setApiKeys(data.apiKeys || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    setLastKey(null);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建失败");
        return;
      }
      setLastKey(data.key);
      setNewName("");
      load();
    } catch {
      setError("网络错误");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`确定删除 API Key「${name || id}」？`)) return;
    await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">API Key 管理</h1>

      <div className="mt-6 max-w-xl space-y-3 rounded border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-800">创建新的 API Key</h2>
        <p className="text-xs text-zinc-500">
          仅在创建时显示明文 Key，请妥善保存。之后将无法再次查看。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="备注名称（可选）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {creating ? "创建中..." : "创建"}
          </button>
        </div>
        {lastKey && (
          <div className="mt-2 rounded bg-zinc-50 p-3 text-xs text-zinc-800">
            <div className="font-semibold text-zinc-900">新建 API Key：</div>
            <div className="mt-1 break-all font-mono">{lastKey}</div>
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">已创建的 Key</h2>
        {loading ? (
          <p className="mt-4 text-zinc-500">加载中...</p>
        ) : apiKeys.length === 0 ? (
          <p className="mt-4 text-zinc-500">暂无 API Key</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-200 text-sm">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="border border-zinc-200 px-3 py-2 text-left">名称</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left">权限</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left">创建时间</th>
                  <th className="border border-zinc-200 px-3 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td className="border border-zinc-200 px-3 py-2">
                      {k.name || "-"}
                    </td>
                    <td className="border border-zinc-200 px-3 py-2">
                      {(k.permissions && k.permissions.join(", ")) || "-"}
                    </td>
                    <td className="border border-zinc-200 px-3 py-2">
                      {k.createdAt
                        ? new Date(k.createdAt).toLocaleString("zh-CN")
                        : "-"}
                    </td>
                    <td className="border border-zinc-200 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(k.id, k.name)}
                        className="text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

