"use client";

import { useRouter } from "next/navigation";

export function MenuActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/admin/menu/${id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full px-3 py-1 text-caption ${
        isActive ? "bg-state-success/15 text-state-success" : "bg-bg-secondary text-text-muted"
      }`}
    >
      {isActive ? "فعال" : "غیرفعال"}
    </button>
  );
}
