"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ShopErrorState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-surface py-16 text-center shadow-sm">
      <span aria-hidden="true" className="text-h1">
        ⚠️
      </span>
      <h2 className="text-h4 text-text-primary">مشکلی در بارگذاری محصولات پیش آمد</h2>
      <p className="max-w-[40ch] text-bodySm text-text-secondary">
        لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
      </p>
      <Button variant="secondary" onClick={() => router.refresh()}>
        تلاش مجدد
      </Button>
    </div>
  );
}
