"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CancelOrderButton({
  orderId,
  cancelDeadline,
}: {
  orderId: string;
  cancelDeadline: string;
}) {
  const router = useRouter();
  const [remainingMs, setRemainingMs] = useState(() => new Date(cancelDeadline).getTime() - Date.now());
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs(new Date(cancelDeadline).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [cancelDeadline]);

  if (remainingMs <= 0) return null;

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  async function handleCancel() {
    setIsCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-requested-with": "karimoglu-web" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "لغو سفارش ممکن نشد.");
        setIsCancelling(false);
        return;
      }
      router.refresh();
    } catch {
      setError("مشکلی در ارتباط با سرور پیش آمد.");
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-5 text-center">
      <p className="text-bodySm text-text-secondary">
        تا {minutes.toLocaleString("fa-IR")}:{String(seconds).padStart(2, "0")} دیگر می‌توانید سفارش را
        لغو کنید.
      </p>
      <Button variant="secondary" disabled={isCancelling} onClick={handleCancel}>
        {isCancelling ? "در حال لغو..." : "لغو سفارش"}
      </Button>
      {error && (
        <p role="alert" className="text-caption text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
