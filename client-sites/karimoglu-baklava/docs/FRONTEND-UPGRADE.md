# ارتقای فرانت‌اند — طراحی «جعبه شیرینی» + انیمیشن‌های GSAP و Motion

## پکیج‌های جدید
- `gsap` + `@gsap/react` — تایم‌لاین لودینگ، Parallax، ScrollTrigger، Marquee
- `motion` — Scroll Reveal، منوی موبایل/سبد خرید، فیلتر شعب، دکمه مغناطیسی، نوار پیشرفت اسکرول
- `@fontsource-variable/vazirmatn` و `@fontsource/lalezar` — فونت‌ها Self-hosted (بدون وابستگی به Google Fonts)

## سیستم طراحی (`tailwind.config.ts` و `app/globals.css`)
- پالت مات: عسلی `honey`، پسته‌ای `pistachio`، شکلاتی/گردویی `cocoa`، کرم یوفکا `cream`، قرمز فینه `brand.red`
- سایه‌های سخت و کاملاً اپک: `shadow-hard-xs/sm/hard/lg/xl` و رنگی (`shadow-hard-honey` ...)
  (توکن‌های قدیمی `shadow-sm/md/lg` هم به نسخه اپک تبدیل شدند تا کل سایت یکدست شود)
- الگوها: `bg-lattice*` (برش لوزی باقلوا)، `bg-phyllo` (لایه‌های یوفکا)، `.matte` (بافت دانه‌دار مات)
- `.arch` (قاب طاق عثمانی هم‌شکل لوگو)، `.eyebrow`، `.box-card`

## انیمیشن‌ها
| فایل | کار |
|---|---|
| `components/fx/IntroLoader.tsx` | لودینگ ورود: ساخته‌شدن یک برش باقلوا (لایه‌ها، پسته، قطره عسل) + سه پرده رنگی. فقط یک‌بار در هر Session؛ کلیک = ۳ برابر سرعت |
| `app/template.tsx` | انیمیشن ورود به هر صفحه (پرده عسلی + بالا آمدن محتوا) |
| `components/fx/Reveal.tsx` | `Reveal`، `Stagger`، `StaggerItem` (Motion whileInView) |
| `components/fx/Marquee.tsx` | نوار متحرک بی‌پایان که به سرعت اسکرول واکنش دارد |
| `components/fx/Parallax.tsx` | Parallax اسکرولی |
| `components/fx/CountUp.tsx` | شمارنده عددی فارسی |
| `components/fx/Magnetic.tsx` | دکمه مغناطیسی |
| `components/fx/HoneyDripDivider.tsx` | لبه «شهدچکان» بین سکشن‌ها |
| `components/fx/ScrollProgress.tsx` | نوار پیشرفت اسکرول |

همه انیمیشن‌ها به تنظیم «کاهش حرکت» (prefers-reduced-motion) سیستم کاربر احترام می‌گذارند.

## تصویرسازی‌ها
`components/decor/Baklava.tsx`: برش ایزومتریک باقلوا، لوزی باقلوا، استکان چای، پسته، قطره عسل، شمسه.
این‌ها تزئینی‌اند و جای عکس واقعی محصول را ادعا نمی‌کنند؛ `ImagePlaceholder` محصولات همچنان سر جایش است.

## نکات
- هیچ متن/ادعای جدیدی اضافه نشده؛ آمارها فقط از اطلاعات تأییدشده (۶ شعبه، ۲ شهر، ۸ تا ۲۴، حدود ۳۰ دقیقه آماده‌سازی) هستند.
- Drawerهای منوی موبایل و سبد خرید با Portal داخل `body` رندر می‌شوند تا هدر Sticky روی موقعیتشان اثر نگذارد.
- `package-lock.json` اضافه شد (Dockerfile از `npm ci` استفاده می‌کند).
