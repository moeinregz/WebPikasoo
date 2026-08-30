export type BusinessCategory =
  | "رستوران و کافه"
  | "فروشگاه و ای‌کامرس"
  | "پزشکی و کلینیک"
  | "املاک و مستغلات"
  | "آموزشی"
  | "خدماتی"
  | "شرکتی و کسب‌وکار"
  | "گردشگری و اقامتی";

export const categories: BusinessCategory[] = [
  "رستوران و کافه",
  "فروشگاه و ای‌کامرس",
  "پزشکی و کلینیک",
  "املاک و مستغلات",
  "آموزشی",
  "خدماتی",
  "شرکتی و کسب‌وکار",
  "گردشگری و اقامتی",
];

export type BusinessSite = {
  id: string;
  name: string;
  category: BusinessCategory;
  desc: string;
  url: string;
  image: string;
};

/**
 * گالری نمونه‌سایت‌های کسب‌وکار.
 * هر وقت یه سایت جدید برای یه نوع کسب‌وکار ساختی، فقط یه آبجکت مثل نمونه‌ی
 * پایین رو اینجا اضافه کن — id یکتا باشه، category دقیقاً یکی از مقادیر
 * آرایه‌ی categories بالا باشه، و image لینک اسکرین‌شات سایت باشه.
 * بقیه‌ی سایت به‌صورت خودکار فیلتر و جستجوی این آرایه رو مدیریت می‌کنه.
 *
 * نمونه:
 * {
 *   id: "cafe-lamiz",
 *   name: "کافه لمیز",
 *   category: "رستوران و کافه",
 *   desc: "سایت معرفی و رزرو میز برای یک کافه؛ منوی آنلاین و گالری تصاویر.",
 *   url: "https://example.com",
 *   image: "https://.../screenshot.jpg",
 * },
 */
export const businessSites: BusinessSite[] = [
  {
    id: "cafe-zemzeme",
    name: "کافه زمزمه",
    category: "رستوران و کافه",
    desc: "لندینگ اتمسفریک برای یک کافه محله‌ای؛ معرفی فضا، منوی آنلاین و رزرو میز.",
    url: "/projects/cafe-zemzeme.html",
    image: "/screenshots/cafe-zemzeme.webp",
  },
  {
    id: "shahd-o-yakh",
    name: "شهد و یخ",
    category: "رستوران و کافه",
    desc: "سایت رنگارنگ برای آبمیوه و بستنی‌فروشی؛ معرفی منو و شعبه‌ها.",
    url: "/projects/shahd-o-yakh.html",
    image: "/screenshots/shahd-o-yakh.webp",
  },
  {
    id: "shirini-forushi",
    name: "قنادی زعفران",
    category: "رستوران و کافه",
    desc: "شیرینی‌سرای سنتی؛ نمایش محصولات، سفارش آنلاین و پک‌های هدیه.",
    url: "/projects/shirini-forushi.html",
    image: "/screenshots/shirini-forushi.webp",
  },
  {
    id: "sholeh-fastfood",
    name: "شعله",
    category: "رستوران و کافه",
    desc: "سایت پرانرژی فست‌فود؛ منوی تصویری، پیشنهادهای ویژه و سفارش آنلاین.",
    url: "/projects/sholeh-fastfood.html",
    image: "/screenshots/sholeh-fastfood.webp",
  },
  {
    id: "simorgh-restaurant",
    name: "سیمرغ",
    category: "رستوران و کافه",
    desc: "رستوران سنتی ایرانی؛ معرفی فضا، منوی غذا و رزرو میز آنلاین.",
    url: "/projects/simorgh-restaurant.html",
    image: "/screenshots/simorgh-restaurant.webp",
  },
  {
    id: "tanoor-bakery",
    name: "تنور",
    category: "رستوران و کافه",
    desc: "نانوایی محله‌ای؛ معرفی محصولات روزانه و ساعات کاری.",
    url: "/projects/tanoor-bakery.html",
    image: "/screenshots/tanoor-bakery.webp",
  },
  {
    id: "boutique-laal",
    name: "لعل",
    category: "فروشگاه و ای‌کامرس",
    desc: "بوتیک لباس زنانه؛ ویترین محصولات با طراحی شیک و مینیمال.",
    url: "/projects/boutique-laal.html",
    image: "/screenshots/boutique-laal.webp",
  },
  {
    id: "chipset-store",
    name: "چیپست",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر؛ دسته‌بندی محصولات و مشخصات فنی.",
    url: "/projects/chipset-store.html",
    image: "/screenshots/chipset-store.webp",
  },
  {
    id: "divan-atr",
    name: "دیوان عطر",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه عطر با هویت بصری شاعرانه؛ معرفی رایحه‌ها و داستان برند.",
    url: "/projects/divan-atr.html",
    image: "/screenshots/divan-atr.webp",
  },
  {
    id: "golgoon-cosmetics",
    name: "گلگون",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه لوازم آرایشی؛ ویترین محصولات و پیشنهادهای فصلی.",
    url: "/projects/golgoon-cosmetics.html",
    image: "/screenshots/golgoon-cosmetics.webp",
  },
  {
    id: "mobatech-store",
    name: "موباتک",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه موبایل و لوازم جانبی؛ مقایسه محصولات و مشخصات فنی.",
    url: "/projects/mobatech-store.html",
    image: "/screenshots/mobatech-store.webp",
  },
  {
    id: "rakhsh-showroom",
    name: "رخش",
    category: "فروشگاه و ای‌کامرس",
    desc: "نمایشگاه اختصاصی خودرو؛ گالری خودروها و فرم درخواست بازدید.",
    url: "/projects/rakhsh-showroom.html",
    image: "/screenshots/rakhsh-showroom.webp",
  },
  {
    id: "saatkade",
    name: "ساعت‌کده",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه ساعت‌های مکانیکال و کلاسیک؛ ویترین لوکس محصولات.",
    url: "/projects/saatkade.html",
    image: "/screenshots/saatkade.webp",
  },
  {
    id: "sneaker-site",
    name: "برق",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه کفش‌های دویدن با طراحی اسپرت و پرحرکت؛ معرفی کالکشن جدید.",
    url: "/projects/sneaker-site.html",
    image: "/screenshots/sneaker-site.webp",
  },
  {
    id: "zarafshan",
    name: "زرافشان",
    category: "فروشگاه و ای‌کامرس",
    desc: "فروشگاه طلا و جواهر؛ ویترین لوکس محصولات با طراحی مجلل.",
    url: "/projects/zarafshan.html",
    image: "/screenshots/zarafshan.webp",
  },
  {
    id: "azmayeshgah-nabz",
    name: "آزمایشگاه نبض",
    category: "پزشکی و کلینیک",
    desc: "آزمایشگاه تشخیص پزشکی؛ نوبت‌دهی آنلاین و معرفی خدمات آزمایشگاهی.",
    url: "/projects/azmayeshgah-nabz.html",
    image: "/screenshots/azmayeshgah-nabz.webp",
  },
  {
    id: "clinic-mehregan",
    name: "کلینیک دامپزشکی مهرگان",
    category: "پزشکی و کلینیک",
    desc: "کلینیک دامپزشکی؛ معرفی خدمات درمانی و نوبت‌دهی آنلاین.",
    url: "/projects/clinic-mehregan.html",
    image: "/screenshots/clinic-mehregan.webp",
  },
  {
    id: "physio-center",
    name: "تعادل",
    category: "پزشکی و کلینیک",
    desc: "مرکز فیزیوتراپی و توانبخشی؛ معرفی خدمات درمانی و رزرو جلسه.",
    url: "/projects/physio-center.html",
    image: "/screenshots/physio-center.webp",
  },
  {
    id: "sepid-dental",
    name: "سپید",
    category: "پزشکی و کلینیک",
    desc: "کلینیک دندانپزشکی؛ معرفی خدمات و نوبت‌دهی آنلاین با طراحی تمیز.",
    url: "/projects/sepid-dental.html",
    image: "/screenshots/sepid-dental.webp",
  },
  {
    id: "zomorod-melk",
    name: "زمرد",
    category: "املاک و مستغلات",
    desc: "مشاور املاک لوکس؛ ویترین ملک‌های ویژه و فرم درخواست مشاوره.",
    url: "/projects/zomorod-melk.html",
    image: "/screenshots/zomorod-melk.webp",
  },
  {
    id: "aamoozeshgah-nava",
    name: "آموزشگاه موسیقی نوا",
    category: "آموزشی",
    desc: "آموزشگاه موسیقی؛ معرفی اساتید، دوره‌ها و ثبت‌نام آنلاین.",
    url: "/projects/aamoozeshgah-nava.html",
    image: "/screenshots/aamoozeshgah-nava.webp",
  },
  {
    id: "zabankadeh",
    name: "زبانکده",
    category: "آموزشی",
    desc: "آموزشگاه زبان‌های زنده دنیا؛ معرفی دوره‌ها، سطوح و ثبت‌نام آنلاین.",
    url: "/projects/zabankadeh.html",
    image: "/screenshots/zabankadeh.webp",
  },
  {
    id: "daftar-vekalat",
    name: "دفتر وکالت پارسا و همکاران",
    category: "خدماتی",
    desc: "سایت رسمی و متین برای یک دفتر وکالت؛ معرفی حوزه‌های تخصصی و تماس.",
    url: "/projects/daftar-vekalat.html",
    image: "/screenshots/daftar-vekalat.webp",
  },
  {
    id: "jadehpeyma-car-rental",
    name: "جاده‌پیما",
    category: "خدماتی",
    desc: "سایت اجاره خودرو؛ لیست خودروها، تعرفه‌ها و فرم رزرو آنلاین.",
    url: "/projects/jadehpeyma-car-rental.html",
    image: "/screenshots/jadehpeyma-car-rental.webp",
  },
  {
    id: "karvan-bar",
    name: "کاروان‌بار",
    category: "خدماتی",
    desc: "شرکت حمل و نقل و باربری سراسری؛ معرفی خدمات و استعلام قیمت.",
    url: "/projects/karvan-bar.html",
    image: "/screenshots/karvan-bar.webp",
  },
  {
    id: "mana-studio",
    name: "استودیو مانا",
    category: "خدماتی",
    desc: "طراحی و اجرای دکوراسیون داخلی؛ نمونه‌کارها و فرم درخواست مشاوره.",
    url: "/projects/mana-studio.html",
    image: "/screenshots/mana-studio.webp",
  },
  {
    id: "pulad-gym",
    name: "پولاد",
    category: "خدماتی",
    desc: "باشگاه بدنسازی؛ معرفی امکانات، برنامه‌های تمرینی و ثبت‌نام آنلاین.",
    url: "/projects/pulad-gym.html",
    image: "/screenshots/pulad-gym.webp",
  },
  {
    id: "salmani-osta",
    name: "سلمونی اوستا",
    category: "خدماتی",
    desc: "آرایشگاه مردانه؛ معرفی خدمات پیرایش و نوبت‌دهی آنلاین.",
    url: "/projects/salmani-osta.html",
    image: "/screenshots/salmani-osta.webp",
  },
  {
    id: "pars-tarash",
    name: "پارس‌تراش",
    category: "شرکتی و کسب‌وکار",
    desc: "شرکت ماشین‌سازی و تجهیزات صنعتی؛ معرفی محصولات و توانمندی‌های تولید.",
    url: "/projects/pars-tarash.html",
    image: "/screenshots/pars-tarash.webp",
  },
  {
    id: "parsgen-pharma",
    name: "پارس‌ژن",
    category: "شرکتی و کسب‌وکار",
    desc: "شرکت داروسازی؛ معرفی محصولات و حوزه‌های فعالیت با هویت علمی و معتبر.",
    url: "/projects/parsgen-pharma.html",
    image: "/screenshots/parsgen-pharma.webp",
  },
  {
    id: "hotel-bagh-shahi",
    name: "هتل باغ شاهی",
    category: "گردشگری و اقامتی",
    desc: "اقامتگاه پنج‌ستاره با معماری باغ ایرانی؛ معرفی اتاق‌ها و رزرو آنلاین.",
    url: "/projects/hotel-bagh-shahi.html",
    image: "/screenshots/hotel-bagh-shahi.webp",
  },
  {
    id: "hotel-morvarid-khazar",
    name: "مروارید خزر",
    category: "گردشگری و اقامتی",
    desc: "هتل بوتیک ساحلی؛ گالری تصاویر، امکانات و رزرو اتاق.",
    url: "/projects/hotel-morvarid-khazar.html",
    image: "/screenshots/hotel-morvarid-khazar.webp",
  },
  {
    id: "karvansara",
    name: "کاروانسرا",
    category: "گردشگری و اقامتی",
    desc: "آژانس مسافرتی؛ معرفی تورهای داخلی و خارجی و رزرو آنلاین.",
    url: "/projects/karvansara.html",
    image: "/screenshots/karvansara.webp",
  },
  {
    id: "pargar-safar",
    name: "پرگار",
    category: "گردشگری و اقامتی",
    desc: "آژانس تخصصی تور و بلیط؛ جست‌وجوی سفر و پیشنهادهای ویژه.",
    url: "/projects/pargar-safar.html",
    image: "/screenshots/pargar-safar.webp",
  },
];
