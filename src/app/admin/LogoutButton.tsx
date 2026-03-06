"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    document.cookie = "admin_session=; path=/; max-age=0";
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100"
    >
      退出登录
    </button>
  );
}
