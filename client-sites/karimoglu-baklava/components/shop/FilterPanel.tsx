"use client";

import { useShopQuery } from "@/lib/useShopQuery";
import type { UnitType } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const unitOptions: { value: UnitType; label: string }[] = [
  { value: "weight", label: "وزنی" },
  { value: "count", label: "عددی" },
  { value: "box", label: "جعبه‌ای" },
];

/**
 * طبق تصمیم صریح UX Architecture (بخش ۴): با توجه به ~۱۰۰ محصول، فیلترها عمداً
 * محدود و پرکاربرد نگه داشته شده‌اند (نه فهرست بلند از فیلترهای کم‌کاربرد).
 * همه فیلترها روی UnitType واقعی محصول (وزن/عدد/جعبه، طبق Blueprint) هستند —
 * چیزی حدس زده نشده.
 */
export function FilterPanel({ onApplied }: { onApplied?: () => void }) {
  const { searchParams, setParam } = useShopQuery();

  const activeUnits = (searchParams.get("unit")?.split(",").filter(Boolean) ?? []) as UnitType[];
  const onlyAvailable = searchParams.get("avail") === "1";
  const minRating = searchParams.get("rating") ?? "";

  function toggleUnit(unit: UnitType) {
    const next = activeUnits.includes(unit)
      ? activeUnits.filter((u) => u !== unit)
      : [...activeUnits, unit];
    setParam({ unit: next.length ? next.join(",") : null });
  }

  function clearAll() {
    setParam({ unit: null, avail: null, min: null, max: null, rating: null });
  }

  const hasActiveFilters = activeUnits.length > 0 || onlyAvailable || minRating !== "";

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-label text-text-secondary">روش فروش</legend>
        {unitOptions.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-bodySm text-text-primary">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border-strong accent-brand-red"
              checked={activeUnits.includes(opt.value)}
              onChange={() => toggleUnit(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-label text-text-secondary">محدوده قیمت (تومان)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="از"
            defaultValue={searchParams.get("min") ?? ""}
            onBlur={(e) => setParam({ min: e.target.value || null })}
            className="h-11 w-full rounded-md border border-border-strong px-3 text-bodySm focus-visible:outline-none"
            aria-label="حداقل قیمت"
          />
          <span className="text-text-muted">تا</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="تا"
            defaultValue={searchParams.get("max") ?? ""}
            onBlur={(e) => setParam({ max: e.target.value || null })}
            className="h-11 w-full rounded-md border border-border-strong px-3 text-bodySm focus-visible:outline-none"
            aria-label="حداکثر قیمت"
          />
        </div>
      </fieldset>

      {/* فیلتر «امتیاز» عمداً حذف شد (اصلاح این مرحله): چون هیچ محصولی
          دیگر Rating ساختگی ندارد (رجوع به رفع باگ در lib/mock-data.ts)،
          این فیلتر همیشه نتیجه خالی برمی‌گرداند — نگه‌داشتنش یک تجربه
          کاربری گمراه‌کننده بود (فیلتری که به‌ظاهر کار می‌کند ولی همیشه
          صفر نتیجه می‌دهد). وقتی نظرات واقعی محصول‌محور فعال شد، این فیلتر
          می‌تواند با معیار واقعی برگردد. */}

      <label className="flex items-center gap-2 text-bodySm text-text-primary">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-border-strong accent-brand-red"
          checked={onlyAvailable}
          onChange={(e) => setParam({ avail: e.target.checked ? "1" : null })}
        />
        فقط کالای موجود
      </label>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={clearAll} disabled={!hasActiveFilters}>
          پاک کردن فیلترها
        </Button>
        {onApplied && (
          <Button variant="primary" size="sm" onClick={onApplied} className="mr-auto">
            نمایش نتایج
          </Button>
        )}
      </div>
    </div>
  );
}
