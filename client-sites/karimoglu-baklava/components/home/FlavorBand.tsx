import { Marquee } from "@/components/fx/Marquee";
import { categoryShowcase } from "@/lib/mock-data";

/**
 * نوار مورب دوطرفه بین Hero و دسته‌بندی‌ها — نام دسته‌های واقعی فروشگاه
 * روی دو نوار عسلی و پسته‌ای که در خلاف جهت هم حرکت می‌کنند.
 */
const Diamond = ({ color }: { color: string }) => (
  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path d="M10 1 19 10 10 19 1 10Z" fill={color} stroke="#1E1611" strokeWidth="2" />
  </svg>
);

export function FlavorBand() {
  const labels = categoryShowcase.map((c) => c.label);
  return (
    <section aria-label="طعم‌های کریم‌اوغلو" className="relative z-[3] -mt-6 overflow-hidden py-8">
      <div className="-rotate-2 border-y-2 border-brand-black bg-honey shadow-[0_6px_0_0_#1E1611]">
        <Marquee
          items={labels}
          speed={70}
          className="py-3"
          itemClassName="font-fancy text-[26px] tablet:text-[34px] text-brand-black"
          separator={<Diamond color="#8EA05E" />}
        />
      </div>
      <div className="-mt-2 rotate-1 border-y-2 border-brand-black bg-pistachio">
        <Marquee
          items={["کیفیت خوب با قیمت خوب", "ارسال همان‌روز", "سرویس کافه در همه شعب", "خرید وزنی، عددی یا جعبه‌ای"]}
          speed={50}
          reverse
          className="py-2"
          itemClassName="text-bodySm font-bold text-brand-black tablet:text-body"
          separator={<Diamond color="#DFA03F" />}
        />
      </div>
    </section>
  );
}
