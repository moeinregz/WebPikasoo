import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Trust from "@/components/Trust";
import Problems from "@/components/Problems";
import BusinessShowcase from "@/components/BusinessShowcase";
import Testimonials from "@/components/Testimonials";
import Services from "@/components/Services";
import Process from "@/components/Process";
import PricingPlans from "@/components/PricingPlans";
import Guarantee from "@/components/Guarantee";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getAllProjects, seedProjectsIfEmpty } from "@/lib/db";
import { businessSites } from "@/lib/businessSites";
import { projectViewUrl } from "@/lib/projectLink";
import { getCurrentUser } from "@/lib/session";

// Homepage previously had no metadata of its own and silently inherited
// the generic root layout title/description for every visit — the single
// highest-value page on the whole site had nothing tailored to it.
export const metadata = {
  title: "وب پیکاسو — طراحی سایت، توسعه نرم‌افزار و سئو",
  description:
    "وب پیکاسو، تیم طراحی و توسعه سایت و نرم‌افزار؛ پنل‌های مدیریتی، فروشگاه اینترنتی، وب اپلیکیشن و سئو حرفه‌ای برای کسب‌وکار شما.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const isLoggedIn = !!(await getCurrentUser());

  // First-ever load: copy the old hardcoded showcase list into the new
  // admin-manageable `projects` collection (no-op once it's populated).
  await seedProjectsIfEmpty(
    businessSites.map((s) => ({
      name: s.name,
      category: s.category,
      description: s.desc,
      url: s.url,
      image: s.image,
    }))
  );
  const allProjects = await getAllProjects();
  const projects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    desc: p.description,
    url: projectViewUrl(p),
    image: p.image,
  }));

  // ترتیب صفحه‌ی اصلی عمداً دنبال یه مسیر فروش/اعتمادسازی مشخصه:
  //
  //   Hero → Trust (اعداد واقعی + چرا ما) → Problems (مشکل/راه‌حل)
  //   → نمونه‌کارها (Case Studies) → Services → Process
  //   → Testimonials → Pricing/Offer → Guarantee → FAQ → Final CTA → Contact
  //
  // یعنی اول نتیجه و اعتماد رو نشون می‌دیم، بعد مشکل بازدیدکننده رو تو
  // کلماتِ خودش می‌گیم، بعد نمونه‌کار و روش کار رو می‌بینه، بعد قیمت و
  // ضمانت و جواب اعتراض‌های رایج (FAQ)، و آخر سر یه CTA نهایی قبل از
  // فرم تماس — دقیقاً همون لحظه‌ای که تصمیم گرفته شده.
  return (
    <>
      <Nav isLoggedIn={isLoggedIn} />
      <Hero />
      <Marquee />
      <Trust />
      <Problems />
      <BusinessShowcase sites={projects} />
      <Services />
      <Process />
      <Testimonials />

      {/* عمداً درست همینجا — بعد از نمونه‌کار، فرآیند کار و نظر مشتری‌ها
          (یعنی بعد از این‌که بازدیدکننده به کیفیت کار اعتماد کرده) و درست
          قبل از بخش تماس. اینجا لحظه‌ایه که بازدیدکننده تصمیم می‌گیره؛
          گذاشتن قیمت زودتر (مثلاً بعد از Hero) اعتماد کافی نساخته و ممکنه
          فقط باعث ترک صفحه بشه، و گذاشتنش دیرتر (مثلاً ته صفحه/فقط تو
          فوتر) باعث می‌شه کاربرهای مصمم قبل از رسیدن به قیمت از دست برن. */}
      <section id="pricing" className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-dot-grid" />
        <div className="relative z-[1] mx-auto max-w-container px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-[26px] font-normal sm:text-[32px]">تعرفه‌ها و پلن‌ها</h2>
            <p className="mx-auto mt-2.5 max-w-[54ch] text-[14.5px] text-dim">
              یه دسته رو انتخاب کن و از بین ۳ پلن، اونی که به کارت میاد رو بردار — قیمت‌ها تقریبی و
              برای شروع مذاکره‌ن، بعد از شنیدن نیاز دقیقت یه پیشنهاد مکتوب و قطعی بهت می‌دیم.
            </p>
          </Reveal>
          <PricingPlans isLoggedIn={isLoggedIn} />
        </div>
      </section>

      <Guarantee />
      <FAQ />

      <Contact />
      <Footer />
    </>
  );
}

