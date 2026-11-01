import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/fx/Reveal";
import { Parallax } from "@/components/fx/Parallax";
import { CountUp } from "@/components/fx/CountUp";
import { BaklavaSlice, BaklavaDiamond, Shamseh, HoneyDrop } from "@/components/decor/Baklava";

/**
 * داستان برند هنوز TODO است (طبق Blueprint، بخش 30). طبق دستور صریح پروژه،
 * محتوای جعلی جایگزین نمی‌شود. فقط حقایق تأییدشده کسب‌وکار (تعداد شعب،
 * شهرهای فعالیت، ساعت کاری، زمان آماده‌سازی سفارش) استفاده شده‌اند.
 */
const STATS = [
  { value: 6, suffix: "", label: "شعبه فعال" },
  { value: 2, suffix: "", label: "شهر: تهران و همدان" },
  { value: 16, suffix: "", label: "ساعت سرویس روزانه" },
  { value: 30, suffix: "", label: "دقیقه آماده‌سازی سفارش (حدوداً)" },
];

export function BrandStory() {
  return (
    <section aria-labelledby="brand-story-heading" className="matte relative overflow-hidden bg-bg-primary bg-phyllo py-20 tablet:py-28">
      <Container className="grid grid-cols-1 items-center gap-14 desktop:grid-cols-2">
        {/* ترکیب تصویرسازی داخل قاب طاق */}
        <Reveal direction="scale" className="relative mx-auto aspect-square w-full max-w-[440px]">
          <div aria-hidden="true" className="absolute inset-0">
            <Parallax speed={0.08} className="absolute inset-[6%]">
              <div className="arch h-full w-full border-[3px] border-brand-black bg-pistachio bg-lattice-pistachio shadow-[-14px_14px_0_0_#1E1611]" />
            </Parallax>
            <Parallax speed={-0.15} className="absolute left-1/2 top-[10%] w-[55%] -translate-x-1/2">
              <Shamseh className="w-full animate-spin-slow text-pistachio-light" />
            </Parallax>
            <Parallax speed={-0.35} rotate={-8} className="absolute bottom-[10%] left-[12%] w-[64%]">
              <BaklavaSlice className="w-full" />
            </Parallax>
            <Parallax speed={-0.6} rotate={30} className="absolute right-[2%] top-[38%] w-[20%]">
              <BaklavaDiamond topping="walnut" className="w-full" />
            </Parallax>
            <Parallax speed={-0.8} className="absolute left-[4%] top-[14%] w-[11%]">
              <HoneyDrop className="w-full" />
            </Parallax>
          </div>
        </Reveal>

        <div className="flex flex-col items-start gap-6 text-right">
          <Reveal>
            <span className="eyebrow">داستان ما</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="brand-story-heading" className="font-fancy text-[38px] leading-[1.2] text-text-primary tablet:text-[52px]">
              درباره <span className="text-brand-red">کریم‌اوغلو</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-body text-text-secondary tablet:text-[17px]">
              باقلوا کریم‌اوغلو امروز با ۶ شعبه فعال در تهران و همدان، شیرینی‌جات سنتی را با تجربه
              خرید مدرن — چه در فروشگاه آنلاین و چه در فضای کافه هر شعبه — در اختیار مشتریان قرار
              می‌دهد.
            </p>
          </Reveal>
          {/* TODO: داستان کامل برند (تاریخچه، فلسفه، تفاوت) پس از دریافت از کارفرما جایگزین این بخش می‌شود */}

          <Reveal delay={0.15} className="w-full">
            <dl className="grid w-full grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col gap-1 rounded-xl border-2 border-brand-black p-4 shadow-hard ${
                    ["bg-honey", "bg-pistachio-light", "bg-surface", "bg-brand-redLight"][i]
                  }`}
                >
                  <dd className="order-1 font-fancy text-[40px] leading-none text-brand-black">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </dd>
                  <dt className="order-2 text-caption font-medium text-text-secondary">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
