export const SITE = {
  name: "شاهکار",
  fullName: "باغچه رستوران شاهکار",
  tagline: "باغچه رستوران",
  phone: "۰۹۳۵۳۰۳۰۵۱۹",
  phoneHref: "tel:+989353030519",
  whatsappNumber: "989353030519",
  whatsappHref: "https://wa.me/989353030519",
  instagram: "sofrehkaneh.shahkar",
  instagramHref: "https://instagram.com/sofrehkaneh.shahkar",
  city: "اسلام‌شهر",
  address:
    "اسلام‌شهر، بعد از میدان گل‌دسته، ورودی فیروزبهرام، اولین باغچه — روبه‌روی باغچه رستوران چهارباغ",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("باغچه رستوران شاهکار اسلامشهر فیروز بهرام"),
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shahkar-garden.ir",
} as const;

export function waLink(text: string) {
  return `${SITE.whatsappHref}?text=${encodeURIComponent(text)}`;
}

export const FEATURES = [
  {
    key: "events",
    title: "پذیرایی تمام‌وقت",
    text: "آماده‌ی پذیرایی از جشن‌ها و میهمانی‌های شما، هر روز و به‌صورت تمام‌وقت.",
  },
  {
    key: "parking",
    title: "پارکینگ اختصاصی",
    text: "بی‌دغدغه از جای پارک بیایید؛ پارکینگ اختصاصی مهمانان شاهکار.",
  },
  {
    key: "food",
    title: "انواع غذاهای ایرانی",
    text: "از کباب‌های زغالی تا خورش‌های اصیل؛ طعم خانگی با سرو تشریفاتی.",
  },
  {
    key: "music",
    title: "موسیقی زنده",
    text: "شب‌هایی با اجرای زنده، زیر پرده‌ی نور و فانوس‌های باغ.",
  },
  {
    key: "stars",
    title: "حضور هنرمندان",
    text: "میزبان هنرمندان سینما و موزیک پاپ کشور در شب‌های ویژه.",
  },
] as const;

export const EVENT_TYPES = [
  "میز ناهار / شام",
  "جشن تولد",
  "عقد و نامزدی",
  "بله‌برون و پاگشا",
  "سالگرد ازدواج",
  "دورهمی خانوادگی",
  "مهمانی کاری",
  "سایر",
] as const;

export const AREAS = ["سالن سرپوشیده", "فضای باز باغچه", "فرقی ندارد"] as const;
export const TIMES = ["ناهار", "عصرانه", "شام", "آخر شب"] as const;
