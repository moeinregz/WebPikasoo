"use client";

import { useShopQuery } from "@/lib/useShopQuery";
import type { UnitType } from "@/lib/types";

const unitLabels: Record<UnitType, string> = { weight: "وزنی", count: "عددی", box: "جعبه‌ای" };

export function ActiveFilterChips() {
  const { searchParams, setParam } = useShopQuery();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  const units = (searchParams.get("unit")?.split(",").filter(Boolean) ?? []) as UnitType[];
  units.forEach((u) => {
    chips.push({
      key: `unit-${u}`,
      label: unitLabels[u],
      onRemove: () => setParam({ unit: units.filter((x) => x !== u).join(",") || null }),
    });
  });

  if (searchParams.get("avail") === "1") {
    chips.push({ key: "avail", label: "فقط موجود", onRemove: () => setParam({ avail: null }) });
  }

  const min = searchParams.get("min");
  const max = searchParams.get("max");
  if (min || max) {
    chips.push({
      key: "price",
      label: `قیمت: ${min ? Number(min).toLocaleString("fa-IR") : "۰"} تا ${
        max ? Number(max).toLocaleString("fa-IR") : "..."
      } تومان`,
      onRemove: () => setParam({ min: null, max: null }),
    });
  }

  const rating = searchParams.get("rating");
  if (rating) {
    chips.push({
      key: "rating",
      label: `امتیاز ${Number(rating).toLocaleString("fa-IR")} به بالا`,
      onRemove: () => setParam({ rating: null }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="فیلترهای فعال">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="flex items-center gap-1 rounded-full bg-bg-secondary px-3 py-1 text-caption text-text-secondary hover:bg-border"
        >
          {chip.label} <span aria-hidden="true">✕</span>
        </button>
      ))}
    </div>
  );
}
