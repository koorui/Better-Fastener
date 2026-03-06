"use client";

import { useState, useEffect } from "react";

const KEYS = [
  { key: "contact_phone", label: "联系电话" },
  { key: "contact_email", label: "联系邮箱" },
  { key: "address", label: "地址" },
  { key: "site_name", label: "站点名称（中文）" },
  { key: "site_name_en", label: "站点名称（英文）" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("保存成功");
      } else {
        setMessage("保存失败");
      }
    } catch {
      setMessage("网络错误");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-500">加载中...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">站点设置</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
        {KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-zinc-700">
              {label}
            </label>
            <input
              type="text"
              value={settings[key] ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [key]: e.target.value }))
              }
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
        ))}
        {message && (
          <p className={message.includes("成功") ? "text-green-600" : "text-red-600"}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </form>
    </div>
  );
}
