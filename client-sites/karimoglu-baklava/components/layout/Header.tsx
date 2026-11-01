import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { categoryShowcase } from "@/lib/mock-data";
import { CartButton } from "@/components/cart/CartButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchIcon, UserIcon } from "@/components/ui/icons";
import { HeaderShell } from "@/components/layout/HeaderShell";
import { Marquee } from "@/components/fx/Marquee";

/**
 * ===== Header (اصلاح‌شده — بخش‌های ۱ تا ۳ Prompt) =====
 *
 * وضعیت قبلی و Root Cause هر باگ گزارش‌شده:
 * - «در Desktop نباید Hamburger باشد»: در کد قبلی اصلاً هیچ Hamburger‌ای
 *   (در هیچ Breakpoint) وجود نداشت؛ Navigation دسته‌بندی‌ها با
 *   `hidden ... desktop:flex` درست از قبل مخفی/نمایان می‌شد. یعنی این بخش
 *   از گزارش را با بررسی واقعی کد رد کردیم (False Positive) — اما چون
 *   دلیل احتمالی گزارش «هیچ Menu‌ای اصلاً دیده نمی‌شد» بوده (چه در دسکتاپ
 *   چه موبایل)، اصلاح واقعی («ساخت یک منوی موبایل واقعی» پایین) همان مشکل
 *   محسوس را برطرف می‌کند.
 * - «Account/Search در Desktop قابل استفاده نیست»: دکمه‌های قبلی صرفاً
 *   `<button>` بدون `onClick` یا `href` بودند — از نظر بصری دکمه، از نظر
 *   عملکردی هیچ‌کاری نمی‌کردند. اینجا Account به `Link` واقعی به `/account`
 *   و Search به `Link` واقعی به `/shop` (که پارامتر `q` را می‌پذیرد،
 *   رجوع به app/shop/page.tsx) تبدیل شده‌اند.
 * - «آیکون‌های زشت/نامفهوم»: Emoji (🔍 ♡ 👤) با SVG خطی یکدست از
 *   components/ui/icons.tsx جایگزین شدند.
 * - آیکون علاقه‌مندی (♡) حذف شد چون هیچ صفحه/سیستم Wishlist واقعی در
 *   پروژه وجود ندارد (فقط یک دکمه Toggle محلی و TODO داخل صفحه محصول) —
 *   نگه‌داشتن یک آیکون Header که به هیچ‌جا وصل نیست دقیقاً همان کلاس باگ
 *   «آیکون تزئینی بدون عملکرد» است که این مرحله قرار است حذف کند، نه اضافه.
 */
// دسته‌های همه‌شعبی در ابتدای categoryShowcase قرار دارند (رجوع به lib/mock-data.ts)
const HEADER_CATEGORY_LIMIT = 6;

const TOPBAR_ITEMS = [
  "ساعت کاری همه شعب: ۰۸:۰۰ تا ۲۴:۰۰",
  "ارسال فوری و همان‌روز به سراسر ایران",
  "۶ شعبه فعال در تهران و همدان",
  "سرویس کافه در تمام شعب",
];

const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border-2 border-transparent text-text-primary transition-all duration-200 hover:border-brand-black hover:bg-honey hover:shadow-hard-xs";

export function Header() {
  return (
    <HeaderShell>
      {/* نوار بالایی: تیکر متحرک اطلاعات واقعی کسب‌وکار */}
      <div className="hidden border-b-2 border-brand-black bg-cocoa text-text-inverseMuted desktop:block">
        <Marquee
          items={TOPBAR_ITEMS}
          speed={40}
          className="py-2 text-caption"
          separator={<span className="text-honey">◆</span>}
        />
      </div>

      <Container className="flex h-16 items-center justify-between gap-4 transition-[height] duration-300 tablet:h-20 tablet:group-data-[scrolled=true]/header:h-16">
        <div className="flex items-center gap-2 desktop:hidden">
          <MobileMenu />
        </div>

        <Link href="/" className="group flex items-center gap-2" aria-label="خانه باقلوا کریم‌اوغلو">
          {/* لوگوی واقعی دریافت‌شده از مجموعه (رجوع به public/images/logo.png) */}
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-black bg-surface shadow-hard-xs transition-transform duration-300 group-hover:-rotate-12 tablet:h-12 tablet:w-12">
            <Image src="/images/logo.png" alt="" width={40} height={40} priority className="h-9 w-9 tablet:h-10 tablet:w-10" />
          </span>
          <span className="hidden font-fancy text-[26px] leading-none text-text-primary tablet:inline">
            کریم‌<span className="text-brand-red">اوغلو</span>
          </span>
        </Link>

        <nav aria-label="دسته‌بندی‌های اصلی" className="hidden items-center gap-5 desktop:flex">
          {/* فقط دسته‌های «همه‌شعبی» (اولین‌ها در آرایه) در Desktop؛ بقیه از
              فروشگاه، Footer و منوی موبایل در دسترس‌اند. */}
          <Link
            href="/shop"
            className="rounded-full border-2 border-brand-black bg-honey px-4 py-1.5 text-bodySm font-bold text-brand-black shadow-hard-xs transition-all hover:-translate-y-0.5 hover:shadow-hard-sm"
          >
            فروشگاه
          </Link>
          {categoryShowcase.slice(0, HEADER_CATEGORY_LIMIT).map((c) => (
            <Link key={c.id} href={`/shop/${c.id}`} className="nav-link text-bodySm font-medium text-text-secondary hover:text-text-primary">
              {c.label}
            </Link>
          ))}
          <Link href="/branches" className="nav-link text-bodySm font-medium text-text-secondary hover:text-text-primary">
            شعب
          </Link>
          <Link href="/menu" className="nav-link text-bodySm font-medium text-text-secondary hover:text-text-primary">
            منو
          </Link>
          <Link href="/cafe" className="nav-link text-bodySm font-medium text-text-secondary hover:text-text-primary">
            کافه
          </Link>
        </nav>

        <div className="flex items-center gap-1 tablet:gap-2">
          <Link href="/shop" aria-label="جستجوی محصولات" className={iconBtn}>
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link href="/account" aria-label="حساب کاربری" className={`${iconBtn} hidden tablet:flex`}>
            <UserIcon className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </Container>
    </HeaderShell>
  );
}
