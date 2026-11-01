import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { Magnetic } from "@/components/fx/Magnetic";
import { Parallax } from "@/components/fx/Parallax";
import { Shamseh, BaklavaSlice, BaklavaDiamond } from "@/components/decor/Baklava";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="matte relative overflow-hidden bg-brand-red bg-lattice-red py-24 tablet:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 w-72 text-brand-redDark tablet:w-96">
        <Shamseh className="w-full animate-spin-slow" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 w-64 text-[#a52234] tablet:w-80">
        <Shamseh className="w-full animate-spin-slow [animation-direction:reverse]" />
      </div>
      <Parallax speed={-0.5} rotate={-12} className="pointer-events-none absolute bottom-6 left-[6%] hidden w-44 desktop:block">
        <BaklavaSlice className="w-full" />
      </Parallax>
      <Parallax speed={-0.7} rotate={20} className="pointer-events-none absolute right-[8%] top-10 hidden w-24 desktop:block">
        <BaklavaDiamond topping="walnut" className="w-full" />
      </Parallax>

      <Container className="relative flex flex-col items-center gap-7 text-center">
        <Reveal>
          <span className="eyebrow">همین حالا</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="final-cta-heading" className="font-fancy text-[44px] leading-[1.15] text-cream tablet:text-[72px]">
            وقت یک طعم <span className="text-honey">اصیل</span> است
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[48ch] text-body text-cream tablet:text-[18px]">
            از باقلوا تا شیرینی خشک، همین حالا سفارش دهید تا از نزدیک‌ترین شعبه برایتان ارسال شود.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Magnetic strength={0.5}>
            <Link href="/shop">
              <Button variant="solidInverse" size="lg" className="!h-16 !px-12 !text-[18px]">
                مشاهده فروشگاه ←
              </Button>
            </Link>
          </Magnetic>
        </Reveal>
      </Container>
    </section>
  );
}
