import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { branches, categoryShowcase } from "@/lib/mock-data";
import { Scallop } from "@/components/decor/Scallop";
import { BaklavaDiamond } from "@/components/decor/Baklava";

const linkClass =
  "group inline-flex items-center gap-2 text-bodySm text-cream/90 transition-colors hover:text-honey";
const Dot = () => (
  <span aria-hidden="true" className="text-[10px] text-honey transition-transform duration-300 group-hover:-translate-x-1 group-hover:rotate-45">
    ◆
  </span>
);

export function Footer() {
  return (
    <footer className="relative text-text-inverse">
      <Scallop color="#2E2018" flip />
      <div className="matte bg-cocoa bg-lattice-dark">
        <Container className="grid grid-cols-1 gap-10 py-16 tablet:grid-cols-2 desktop:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* نسخه خط‌سفید لوگو روی پس‌زمینه تیره (public/images/logo-dark.png) */}
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-blackDeep bg-cocoa-light shadow-hard-honey">
                <Image src="/images/logo-dark.png" alt="باقلوا کریم‌اوغلو" width={56} height={56} className="h-12 w-12" />
              </span>
              <span className="font-fancy text-[30px] leading-none text-cream">
                کریم‌<span className="text-honey">اوغلو</span>
              </span>
            </div>
            <p className="max-w-[34ch] text-bodySm text-text-inverseMuted">
              شیرینی سنتی با استاندارد ارائه مدرن — تولید و عرضه باقلوا، استانبولی و شیرینی‌جات در
              تهران و همدان.
            </p>
            <div className="flex gap-3 pt-2" aria-label="شبکه‌های اجتماعی">
              {/* TODO: لینک شبکه‌های اجتماعی رسمی برند هنوز ارسال نشده */}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-fancy text-[22px] text-honey">فروشگاه</h3>
            <nav className="flex flex-col gap-2.5">
              {categoryShowcase.map((c) => (
                <Link key={c.id} href={`/shop/${c.id}`} className={linkClass}>
                  <Dot />
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-fancy text-[22px] text-honey">شعب</h3>
            <nav className="flex flex-col gap-2.5">
              {branches.map((b) => (
                <Link key={b.id} href={`/branches/${b.slug}`} className={linkClass}>
                  <Dot />
                  {b.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-fancy text-[22px] text-honey">خدمات مشتری</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                ["/menu", "منو"],
                ["/faq", "سوالات متداول"],
                ["/contact", "تماس با ما"],
                ["/terms", "قوانین و مقررات"],
                ["/privacy", "حریم خصوصی"],
              ].map(([href, label]) => (
                <Link key={href} href={href!} className={linkClass}>
                  <Dot />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>

        {/* نام برند غول‌پیکر در پایین فوتر */}
        <div aria-hidden="true" className="relative overflow-hidden">
          <Container className="flex items-end justify-between gap-6">
            <p className="select-none font-fancy text-[22vw] leading-[0.8] text-cocoa-light desktop:text-[220px]">
              کریم‌اوغلو
            </p>
            <BaklavaDiamond className="mb-6 hidden w-28 shrink-0 animate-float tablet:block" />
          </Container>
        </div>
      </div>

      <div className="border-t-2 border-brand-blackDeep bg-brand-blackDeep">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-caption text-text-inverseMuted tablet:flex-row">
          <span>© {new Date().getFullYear()} باقلوا کریم‌اوغلو. تمام حقوق محفوظ است.</span>
          <span className="text-honey">ساخته‌شده با لایه‌لایه عشق ◆</span>
          {/* TODO: نماد اعتماد الکترونیکی پس از دریافت اضافه می‌شود */}
        </Container>
      </div>
    </footer>
  );
}
