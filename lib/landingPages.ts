// نقشه‌ی ۹ صفحه لندینگ سئو (کلاستر «طراحی سایت») — یه منبع واحد برای
// مسیر/عنوان هر صفحه تا لینک‌سازی داخلی بین همه‌شون یکدست بمونه. هر صفحه‌ی
// جدید که ساخته می‌شه باید از همین کلیدها لینک بگیره، نه رشته‌ی مسیر
// دستی، تا اگه یه مسیر بعداً عوض شد فقط همینجا اصلاح بشه.
export const landingPages = {
  websiteDesign: { slug: "website-design", title: "طراحی سایت" },
  storeDesign: { slug: "store-design", title: "طراحی سایت فروشگاهی" },
  corporateDesign: { slug: "corporate-design", title: "طراحی سایت شرکتی" },
  customDesign: { slug: "custom-design", title: "طراحی سایت اختصاصی" },
  wordpressDesign: { slug: "wordpress-design", title: "طراحی سایت وردپرس" },
  websitePrice: { slug: "website-price", title: "قیمت طراحی سایت" },
  designCompany: { slug: "design-company", title: "شرکت طراحی سایت" },
  seoServices: { slug: "seo-services", title: "خدمات سئو" },
  cheapDesign: { slug: "cheap-design", title: "طراحی سایت ارزان" },
} as const;

export type LandingKey = keyof typeof landingPages;

export function landingHref(key: LandingKey): string {
  return `/${landingPages[key].slug}`;
}
