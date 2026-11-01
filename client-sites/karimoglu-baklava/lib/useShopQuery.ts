"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * این هوک به Componentهای فیلتر/مرتب‌سازی/جستجو اجازه می‌دهد Query String واقعی
 * URL را تغییر دهند (نه صرفاً State داخلی) — این‌طور هم آدرس هر حالت فیلترشده
 * قابل اشتراک‌گذاری است، هم دکمه Back مرورگر به‌درستی کار می‌کند.
 */
export function useShopQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // هر تغییر فیلتر/مرتب‌سازی، صفحه را به ۱ برمی‌گرداند مگر خود page تغییر کرده باشد
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, setParam };
}
