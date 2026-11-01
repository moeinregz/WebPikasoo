"use client";

import { useRouter } from "next/navigation";

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter();

  async function act(action: "approve" | "reject" | "delete") {
    if (action === "delete" && !window.confirm("این نظر حذف منطقی شود؟")) return;
    const url = `/api/admin/reviews/${id}`;
    if (action === "delete") {
      await fetch(url, { method: "DELETE", headers: { "x-requested-with": "karimoglu-web" } });
    } else {
      await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
        body: JSON.stringify({ approve: action === "approve" }),
      });
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-caption">
      <button type="button" onClick={() => act("approve")} className="text-state-success hover:underline">
        تأیید
      </button>
      <button type="button" onClick={() => act("reject")} className="text-state-warning hover:underline">
        رد
      </button>
      <button type="button" onClick={() => act("delete")} className="text-state-error hover:underline">
        حذف
      </button>
    </div>
  );
}
