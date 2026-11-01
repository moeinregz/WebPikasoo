import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";

/**
 * هنوز نظر واقعی مشتری در سیستم ثبت نشده (Review UX در فاز MVP بعد از اولین
 * فروش‌ها فعال می‌شود). طبق دستور صریح، از نظرات جعلی استفاده نمی‌شود.
 * این Section یک ساختار آماده است که با اولین نظرات واقعی
 * (از طریق `GET /api/v1/reviews?featured=true`) پر می‌شود.
 */
export function SocialProof() {
  return (
    <section aria-labelledby="reviews-heading" className="matte relative bg-pistachio-light bg-lattice-pistachio py-20 tablet:py-24">
      <Container className="flex flex-col items-center gap-10 text-center">
        <SectionHeading id="reviews-heading" eyebrow="صدای مشتریان" title="نظر مشتریان ما" align="center" />
        <Reveal direction="scale" className="w-full max-w-2xl">
          <div className="relative flex flex-col items-center gap-5 rounded-2xl border-2 border-brand-black bg-surface p-10 shadow-hard-lg">
            <span
              aria-hidden="true"
              className="absolute -top-7 right-8 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-black bg-honey font-fancy text-[44px] leading-none shadow-hard-sm"
            >
              ”
            </span>
            <div aria-hidden="true" className="flex gap-1 text-[22px] text-honey-deep">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <p className="text-body text-text-secondary">
              نظرات مشتریان به‌زودی در همین بخش نمایش داده می‌شود. هر سفارش تحویل‌شده امکان
              امتیازدهی و ثبت نظر برای مشتری فراهم می‌کند.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
