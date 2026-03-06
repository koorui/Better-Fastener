"use client";

import { useEffect, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [utm, setUtm] = useState({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
  });
  const [landingPage, setLandingPage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    setUtm({
      utmSource: sp.get("utm_source") || "",
      utmMedium: sp.get("utm_medium") || "",
      utmCampaign: sp.get("utm_campaign") || "",
      utmContent: sp.get("utm_content") || "",
      utmTerm: sp.get("utm_term") || "",
    });
    setLandingPage(window.location.href);
  }, []);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          formType: "contact",
          ...utm,
          landingPage,
          referrer:
            typeof document !== "undefined" ? document.referrer || undefined : undefined,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">姓名</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={handleChange("email")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">电话</label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">公司</label>
          <input
            type="text"
            value={form.company}
            onChange={handleChange("company")}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          />
        </div>
      </div>
      <div className="md:col-span-1 flex flex-col">
        <label className="block text-sm font-medium text-zinc-700">
          留言内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.message}
          onChange={handleChange("message")}
          rows={6}
          className="mt-1 flex-1 rounded border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 inline-flex items-center justify-center rounded bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "提交中..." : "提交询问"}
        </button>
        {status === "success" && (
          <p className="mt-2 text-sm text-green-600">提交成功，我们会尽快与您联系。</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-red-600">提交失败，请稍后重试。</p>
        )}
      </div>
    </form>
  );
}

