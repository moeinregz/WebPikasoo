import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/fx/Reveal";
import { Parallax } from "@/components/fx/Parallax";
import { TeaGlass, BaklavaSlice, BaklavaDiamond } from "@/components/decor/Baklava";

export function CafeExperience() {
  return (
    <section
      aria-labelledby="cafe-heading"
      className="matte relative overflow-hidden border-y-2 border-brand-black bg-honey bg-lattice-honey py-20 tablet:py-28"
    >
      <Container className="grid grid-cols-1 items-center gap-14 desktop:grid-cols-2">
        <div className="order-2 flex flex-col items-start gap-5 text-right desktop:order-1">
          <Reveal>
            <span className="eyebrow !bg-cream">کافه کریم‌اوغلو</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="cafe-heading" className="font-fancy text-[38px] leading-[1.2] text-brand-black tablet:text-[52px]">
              تجربه کافه، در تمام شعب ما
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-[48ch] text-body text-cocoa tablet:text-[17px]">
              تمام ۶ شعبه کریم‌اوغلو امکان سرویس حضوری و فضای کافه دارند — فرصتی برای لذت بردن از
              محصولات تازه در همان لحظه، کنار یک چای یا قهوه.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href="/cafe">
              <Button variant="primary" size="lg">
                مشاهده شعب دارای کافه
              </Button>
            </Link>
          </Reveal>
        </div>

        <Reveal direction="tilt" className="order-1 desktop:order-2">
          <div aria-hidden="true" className="relative mx-auto aspect-[5/4] w-full max-w-[480px]">
            {/* میز / سینی */}
            <div className="absolute inset-x-[4%] bottom-[6%] h-[34%] rounded-[50%] border-[3px] border-brand-black bg-brand-red shadow-[-10px_10px_0_0_#1E1611]" />
            <div className="absolute inset-x-[14%] bottom-[13%] h-[20%] rounded-[50%] border-2 border-dashed border-cream" />
            <Parallax speed={-0.2} className="absolute bottom-[20%] right-[10%] w-[26%]">
              <TeaGlass className="w-full" />
            </Parallax>
            <Parallax speed={-0.35} rotate={-6} className="absolute bottom-[16%] left-[10%] w-[44%]">
              <BaklavaSlice topping="walnut" className="w-full" />
            </Parallax>
            <Parallax speed={-0.6} rotate={25} className="absolute left-[40%] top-[6%] w-[16%]">
              <BaklavaDiamond className="w-full" />
            </Parallax>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
