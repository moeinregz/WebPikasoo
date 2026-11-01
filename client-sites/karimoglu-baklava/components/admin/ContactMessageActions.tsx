"use client";

import { useRouter } from "next/navigation";

export function ContactMessageActions({ id, status }: { id: string; status: "new" | "read" | "resolved" }) {
  const router = useRouter();

  async function setStatus(next: "read" | "resolved") {
    await fetch(`/api/admin/contact-messages/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-caption">
      {status === "new" && (
        <button type="button" onClick={() => setStatus("read")} className="text-state-warning hover:underline">
          علامت‌گذاری به‌عنوان خوانده‌شده
        </button>
      )}
      {status !== "resolved" && (
        <button type="button" onClick={() => setStatus("resolved")} className="text-state-success hover:underline">
          رسیدگی شد
        </button>
      )}
    </div>
  );
}
