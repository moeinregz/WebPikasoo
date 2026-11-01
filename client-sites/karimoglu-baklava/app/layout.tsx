import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource/lalezar/400.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { SITE_NAME, SITE_URL } from "@/lib/seo/siteConfig";
import { IntroLoader } from "@/components/fx/IntroLoader";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { introHeadScript } from "@/lib/fx/intro";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "باقلوا کریم‌اوغلو | خرید آنلاین باقلوا و شیرینی سنتی",
    template: "%s | باقلوا کریم‌اوغلو",
  },
  description:
    "خرید آنلاین باقلوا، استانبولی، باقلوا عربی و شیرینی خشک از باقلوا کریم‌اوغلو — ۶ شعبه فعال در تهران و همدان، ارسال فوری و همان‌روز به سراسر ایران.",
  openGraph: {
    title: "باقلوا کریم‌اوغلو | خرید آنلاین باقلوا و شیرینی سنتی",
    description:
      "خرید آنلاین باقلوا، استانبولی و شیرینی سنتی با ارسال فوری و همان‌روز به سراسر ایران.",
    url: siteUrl,
    siteName: "باقلوا کریم‌اوغلو",
    locale: "fa_IR",
    type: "website",
    // لوگوی واقعی دریافت‌شده از مجموعه — رجوع به public/images/og-default.png
    images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: "باقلوا کریم‌اوغلو" }],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    // TODO: logo پس از دریافت فایل رسمی اضافه می‌شود
    address: [
      { "@type": "PostalAddress", addressLocality: "تهران", addressCountry: "IR" },
      { "@type": "PostalAddress", addressLocality: "همدان", addressCountry: "IR" },
    ],
  };

  // Schema.org WebSite + SearchAction — طبق بخش ۲۰ Prompt 12. جستجوی داخلی
  // سایت روی `/shop?q=` کار می‌کند (`lib/shop.ts`)، پس دقیقاً همان URL واقعی
  // اینجا معرفی می‌شود؛ هیچ مسیر جستجوی جداگانه‌ای ساخته/ادعا نشده.
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    // suppressHydrationWarning: اسکریپت inline سر صفحه، پیش از Hydration کلاس
    // وضعیت لودینگ (intro-seen / intro-lock) را روی <html> می‌گذارد.
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introHeadScript }} />
        <meta name="theme-color" content="#2E2018" />
        <noscript>
          <style>{`.intro-loader{display:none!important}html.intro-lock,html.intro-lock body{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="font-primary text-text-primary antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-brand-black focus:px-4 focus:py-2 focus:text-text-inverse"
        >
          رفتن به محتوای اصلی
        </a>
        <MotionProvider>
          <IntroLoader />
          <ScrollProgress />
          <CartProvider>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
