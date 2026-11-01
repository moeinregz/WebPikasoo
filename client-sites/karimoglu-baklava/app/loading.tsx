import { BaklavaDiamond } from "@/components/decor/Baklava";

/** لودینگ بین صفحات (هنگام دریافت داده از سرور) — لوزی باقلوای چرخان */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative h-24 w-24">
        <span className="absolute inset-0 rounded-full border-4 border-dashed border-honey animate-spin-slow [animation-duration:6s]" />
        <BaklavaDiamond className="absolute inset-3 animate-bounce" />
      </div>
      <span className="font-fancy text-[22px] text-text-secondary">در حال آماده‌سازی…</span>
    </div>
  );
}
