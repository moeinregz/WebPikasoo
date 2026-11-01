"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/apiClient";

type Status = "idle" | "checking" | "resolved" | "unavailable" | "error";

interface AvailabilityResponse {
  status: "resolved" | "unavailable";
  branchName: string | null;
}

/**
 * این کامپوننت دیگر موجودی را حدس نمی‌زند — نتیجه واقعی سیستم موجودی
 * (`POST /api/inventory/product-availability`، طبق Prompt 9) را نمایش
 * می‌دهد. Backend مرجع نهایی است؛ اینجا فقط نمایش است، نه تصمیم‌گیری.
 * طبق الزام «اطلاعات حساس موجودی داخلی را در اختیار کاربر قرار نده»، فقط
 * وضعیت کلی (موجود/ناموجود) و نام شعبه نمایش داده می‌شود — هرگز عدد دقیق.
 */
export function BranchAvailability({
  isProductAvailable,
  productId,
  variantId,
}: {
  isProductAvailable: boolean;
  productId: string;
  variantId: string;
}) {
  const [city, setCity] = useState<"تهران" | "همدان" | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [resolvedBranchName, setResolvedBranchName] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !isProductAvailable) return;
    let cancelled = false;
    setStatus("checking");

    apiPost<AvailabilityResponse>("/api/inventory/product-availability", { productId, variantId, city })
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setStatus("error");
          return;
        }
        setResolvedBranchName(data.branchName);
        setStatus(data.status);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [city, isProductAvailable, productId, variantId]);

  if (!isProductAvailable) {
    return (
      <div className="rounded-md bg-state-warningBg px-4 py-3 text-bodySm text-state-warning">
        این محصول در حال حاضر در هیچ شعبه‌ای موجود نیست.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-bg-secondary px-4 py-3">
      {status === "idle" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-bodySm text-text-secondary">
            برای بررسی امکان ارسال، شهر خود را انتخاب کنید:
          </span>
          <div className="flex gap-2">
            {(["تهران", "همدان"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className="rounded-full border border-border-strong px-3 py-1 text-caption text-text-primary hover:border-brand-black"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "checking" && (
        <p className="flex items-center gap-2 text-bodySm text-text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-red" aria-hidden="true" />
          در حال بررسی نزدیک‌ترین شعبه...
        </p>
      )}

      {status === "resolved" && resolvedBranchName && (
        <p className="text-bodySm text-text-primary">
          <span className="text-state-success">✓</span> قابل ارسال از شعبه{" "}
          <strong>{resolvedBranchName}</strong>
        </p>
      )}

      {status === "unavailable" && (
        <p className="text-bodySm text-state-warning">
          در حال حاضر امکان ارسال به این منطقه وجود ندارد. لطفاً با پشتیبانی تماس بگیرید.
        </p>
      )}

      {status === "error" && (
        <p className="text-bodySm text-state-warning">
          بررسی موجودی با خطا مواجه شد. لطفاً دوباره تلاش کنید.
        </p>
      )}
    </div>
  );
}
