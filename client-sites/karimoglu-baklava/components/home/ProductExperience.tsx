import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/fx/Reveal";
import { GiftBoxIcon, LayersIcon, ScaleIcon, StoreIcon } from "@/components/decor/FeatureIcons";

/**
 * فقط مواردی که با اطلاعات واقعی کسب‌وکار (Blueprint) سازگارند در این‌جا آمده‌اند:
 * تنوع دسته‌بندی، بسته‌بندی متنوع (تأییدشده)، و پوشش شعب. مواردی مثل "تازگی روزانه"
 * یا زمان دقیق تولید که در Blueprint تأیید نشده، عمداً حذف شده تا ادعای بی‌پایه ایجاد نشود.
 */
const points = [
  {
    Icon: LayersIcon,
    title: "تنوع واقعی محصول",
    description: "از باقلوا و استانبولی تا شیرینی خشک، دنر کباب و فست‌فود — همه در یک مجموعه.",
    tone: "bg-pistachio-light",
  },
  {
    Icon: GiftBoxIcon,
    title: "بسته‌بندی متناسب با نیاز شما",
    description: "چند نوع بسته‌بندی برای مصرف روزمره، پذیرایی یا هدیه.",
    tone: "bg-honey-light",
  },
  {
    Icon: ScaleIcon,
    title: "خرید بر اساس نیاز شما",
    description: "امکان خرید وزنی، عددی یا جعبه‌ای — دقیقاً به اندازه‌ای که لازم دارید.",
    tone: "bg-cream",
  },
  {
    Icon: StoreIcon,
    title: "دسترسی از ۶ شعبه فعال",
    description: "در تهران و همدان، با امکان سفارش آنلاین یا حضور در فضای کافه.",
    tone: "bg-brand-redLight",
  },
];

export function ProductExperience() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="matte relative overflow-hidden bg-brand-red bg-lattice-red py-16 tablet:py-24"
    >
      <Container className="relative flex flex-col gap-12">
        <SectionHeading
          id="experience-heading"
          eyebrow="چرا کریم‌اوغلو"
          title="تجربه خرید از کریم‌اوغلو"
          align="center"
          tone="inverse"
        />
        <Stagger className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4" stagger={0.12}>
          {points.map(({ Icon, title, description, tone }, i) => (
            <StaggerItem key={title} className="h-full">
              <div
                className={`group relative flex h-full flex-col items-start gap-4 rounded-xl border-2 border-brand-black p-6 text-right shadow-hard-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:translate-x-1 hover:shadow-hard-xl ${tone}`}
              >
                <span className="absolute left-4 top-3 font-fancy text-[44px] leading-none text-brand-black/15">
                  {(i + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
                </span>
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brand-black bg-surface shadow-hard-sm transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                  <Icon className="h-10 w-10" />
                </span>
                <h3 className="text-h4 font-bold text-text-primary">{title}</h3>
                <p className="text-bodySm text-text-secondary">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
